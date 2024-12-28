import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  user: any = {}; // Contient les données utilisateur
  userId: string = ''; // ID de l'utilisateur connecté
  photoURL: string = 'assets/default-profile.png'; // Photo par défaut

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
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

  // Change la photo de profil
  changeProfilePicture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const filePath = `profile-images/${this.userId}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, file);

        task
          .snapshotChanges()
          .pipe(
            finalize(() => {
              fileRef.getDownloadURL().subscribe((url) => {
                this.photoURL = url;
                this.user.photoURL = url; // Met à jour localement
              });
            })
          )
          .subscribe();
      }
    };
    input.click();
  }

  // Met à jour les informations utilisateur dans Firestore
  updateProfile() {
    this.firestore
      .collection('users')
      .doc(this.userId)
      .update(this.user)
      .then(() => {
        console.log('Profil mis à jour avec succès.');
        this.router.navigate(['/profile']); // Retourne à la page de profil
      })
      .catch((error) => {
        console.error('Erreur lors de la mise à jour du profil :', error);
      });
  }

  // Annule les modifications
  cancel() {
    this.router.navigate(['/profile']);
  }
}
