import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: any = {}; // Contient les données utilisateur
  userId: string = ''; // ID de l'utilisateur connecté
  photoURL: string = 'assets/default-profile.png'; // Photo par défaut

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        this.loadUserProfile();
      }
    });
  }

  // Charge les données utilisateur depuis Firestore
  loadUserProfile() {
    this.firestore
      .collection('users')
      .doc(this.userId)
      .valueChanges()
      .subscribe((data: any) => {
        if (data) {
          this.user = data;
          this.photoURL = data.photoURL || 'assets/default-profile.png';
        }
      });
  }

  // Navigation vers la page d'édition
  editProfile() {
    this.router.navigate(['/edit-profile']);
  }
}
