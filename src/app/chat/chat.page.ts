import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  messages: any[] = [];
  newMessage: string = '';
  currentUserId: string = '';
  chatPartnerId: string = '';
  chatId: string = '';
  chatPartnerName: string = 'Chat';

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.chatPartnerId = params['userId']; // Récupérer l'ID de l'autre utilisateur depuis les paramètres
  
      if (!this.chatPartnerId) {
        console.error('No chat partner ID found in query parameters!');
        return;
      }
  
      this.authService.getAuthState().subscribe((user) => {
        if (user) {
          this.currentUserId = user.uid;
  
          // Vérifier si currentUserId et chatPartnerId sont définis
          if (!this.currentUserId || !this.chatPartnerId) {
            console.error('Invalid user IDs:', {
              currentUserId: this.currentUserId,
              chatPartnerId: this.chatPartnerId,
            });
            return;
          }
  
          // Générer l'identifiant unique pour le chat
          this.chatId =
            this.currentUserId < this.chatPartnerId
              ? `${this.currentUserId}_${this.chatPartnerId}`
              : `${this.chatPartnerId}_${this.currentUserId}`;
              console.log('Chat ID:', this.chatId);
  
          // Charger les messages
          this.loadMessages();
          this.loadChatPartnerName();
        }else {
          console.error('User not authenticated.');
        }
      });
    });
  }
  
  loadChatPartnerName() {
    this.firestore
      .collection('users')
      .doc(this.chatPartnerId)
      .valueChanges()
      .subscribe((user: any) => {
        if (user) {
          this.chatPartnerName = `${user.firstName} ${user.lastName}`;
        } else {
          this.chatPartnerName = 'Unknown User';
        }
      });
  }

  loadMessages() {
    if (!this.chatId) {
      console.error('Cannot load messages without chatId');
      return;
    }
    this.firestore
      .collection('messages')
      .doc(this.chatId)
      .valueChanges()
      .subscribe((chat: any) => {
        this.messages = chat ? chat.messages : [];
        console.log('Messages loaded:', this.messages);
      });
  }

  sendMessage() {
    if (!this.newMessage.trim()) {
      console.warn('Empty message. Skipping...');
      return;
    }
  
    if (!this.chatId || !this.currentUserId || !this.chatPartnerId) {
      console.error('Missing required data for sending message:', {
        chatId: this.chatId,
        currentUserId: this.currentUserId,
        chatPartnerId: this.chatPartnerId,
      });
      return;
    }
  
    const message = {
      senderId: this.currentUserId,
      content: this.newMessage,
      timestamp: new Date(),
    };
  
    this.firestore
      .collection('messages')
      .doc(this.chatId)
      .set(
        {
          participants: [this.currentUserId, this.chatPartnerId],
          messages: firebase.firestore.FieldValue.arrayUnion(message),
        },
        { merge: true }
      )
      .then(() => {
        this.newMessage = ''; // Réinitialise le champ de saisie après l'envoi
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
  }
  
}
