import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.page.html',
  styleUrls: ['./search-users.page.scss'],
})
export class SearchUsersPage implements OnInit {
  searchTerm: string = '';
  users: any[] = [];
  filteredUsers: any[] = [];
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
        this.loadAllUsers();
      }
    });
  }

  // Charger tous les utilisateurs
  loadAllUsers() {
    this.firestore
      .collection('users')
      .valueChanges()
      .subscribe((users: any[]) => {
        // Filtrer pour exclure l'utilisateur actuel
        this.users = users.filter((user) => user.uid !== this.currentUserId);
        this.filteredUsers = [...this.users]; // Par défaut, tous les utilisateurs apparaissent
      });
  }

  // Filtrer les utilisateurs
  searchUsers() {
    if (this.searchTerm.trim() === '') {
      this.filteredUsers = [...this.users]; // Réinitialiser si la recherche est vide
    } else {
      this.filteredUsers = this.users.filter((user) =>
        user.firstName
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    }
  }

  // Démarrer une conversation
  startChat(user: any) {
    const chatId =
      this.currentUserId < user.uid
        ? `${this.currentUserId}_${user.uid}`
        : `${user.uid}_${this.currentUserId}`;

    this.router.navigate(['/chat'], { queryParams: { userId: user.uid } });
  }
}
