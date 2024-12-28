import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.page.html',
  styleUrls: ['./chat-list.page.scss'],
})
export class ChatListPage implements OnInit {
  conversations: any[] = []; // Pour les chats individuels
  groups: any[] = []; // Pour les groupes
  calls: any[] = []; // Pour les appels
  selectedSegment: string = 'chats'; // Onglet sélectionné par défaut
  currentUserId: string = '';

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getAuthState().subscribe((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.loadChats();
        this.loadGroups();
        this.loadCalls();
      }
    });
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  loadChats() {
    this.firestore
      .collection('messages', (ref) =>
        ref.where('participants', 'array-contains', this.currentUserId)
      )
      .valueChanges()
      .subscribe((conversations) => {
        this.conversations = conversations;
      });
  }

  loadGroups() {
    this.firestore
      .collection('groups', (ref) =>
        ref.where('members', 'array-contains', this.currentUserId)
      )
      .valueChanges()
      .subscribe((groups) => {
        this.groups = groups;
      });
  }

  loadCalls() {
    // Simuler les appels pour l'instant
    this.calls = [
      { name: 'John Doe', time: 'Yesterday at 8:30 PM' },
      { name: 'Jane Doe', time: 'Today at 10:00 AM' },
    ];
  }

  openChat(conversation: any) {
    const otherUserId = conversation.participants.find(
      (id: string) => id !== this.currentUserId
    );
    this.router.navigate(['/chat'], { queryParams: { userId: otherUserId } });
  }

  openGroup(group: any) {
    this.router.navigate(['/group-chat'], { queryParams: { groupId: group.id } });
  }

  openCall(call: any) {
    console.log('Opening call:', call);
  }

  addNewConversation() {
    this.router.navigate(['/search-users']); // Page pour rechercher des utilisateurs
  }

  startChat(user: any) {
    if (!user.uid) {
      console.error('Invalid user ID for chat partner');
      return;
    }
  
    this.router.navigate(['/chat'], { queryParams: { userId: user.uid } });
  }
  
}
