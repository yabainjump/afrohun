import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Observable, map } from 'rxjs';
import  firebase from 'firebase/compat/app';

export interface Post {
  id?: string;
  authorId: string;
  content: string;
  imageUrl?: string; // Permet undefined
  likes: number;
  title?: string;
  newComment?: string;
  relativeTime?: string;
  likedBy?: string[]; // Liste des utilisateurs ayant liké
  comments?: string[]; // Liste des commentaires
  timestamp: Date; // Date de création de la publication
  userHasLiked?: boolean; // Si l'utilisateur actuel a liké
  author?: { // Informations sur l'auteur
    firstName: string;
    lastName: string;
    institution: string;
    photoURL?: string;
  };
}



export interface User {
  uid: string; // Identifiant unique de l'utilisateur
  firstName: string; // Prénom
  lastName: string; // Nom
  photoURL?: string; // Photo de profil (optionnelle)
  institution?: string; // Poste ou description (optionnelle)
  [key: string]: any; // Pour gérer des champs supplémentaires si nécessaire
}




@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  private collectionName = 'posts';

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  // Ajouter une publication
  addPost(post: Post): Promise<any> {
    return this.firestore.collection<Post>(this.collectionName).add(post);
  }

  //interface de post
  
  // Télécharger une image
  uploadImage(file: File): Promise<string> {
    const filePath = `images/${Date.now()}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
  
    return new Promise((resolve, reject) => {
      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe({
              next: (url) => resolve(url), // Résout avec l'URL de l'image
              error: (err) => {
                console.error('Error retrieving file URL:', err);
                reject(err);
              },
            });
          })
        )
        .subscribe({
          error: (err) => {
            console.error('Error during upload:', err);
            reject(err);
          },
        });
    });
  }
  

  ///methode pour recuperer les users 
  getUser(userId: string): Observable<User | undefined> {
    return this.firestore.collection<User>('users').doc(userId).valueChanges();
  }
  
  
  // Methode de des likes
  likePost(postId: string): Promise<void> {
    return this.firestore
      .collection('posts')
      .doc(postId)
      .update({
        likedBy: firebase.firestore.FieldValue.arrayUnion('current-user-id'),
      });
  }
  
  
  // methode de commentaire sur publication
addComment(postId: string, comment: string): Promise<void> {
  return this.firestore
    .collection(this.collectionName)
    .doc(postId)
    .update({
      comments: firebase.firestore.FieldValue.arrayUnion(comment),
    });
}



  // Récupérer les publications en temps réel
  getPosts(): Observable<Post[]> {
    return this.firestore
      .collection<Post>('posts', (ref) => ref.orderBy('timestamp', 'desc'))
      .valueChanges({ idField: 'id' })
      .pipe(
        map((posts: Post[]) => {
          console.log('Raw posts:', posts); // Journal pour voir les données brutes
          return posts.map((post: Post) => {
            // Conversion du timestamp
            if (post.timestamp && (post.timestamp as any).seconds) {
              post.timestamp = new Date((post.timestamp as any).seconds * 1000);
            } else if (typeof post.timestamp === 'string') {
              post.timestamp = new Date(post.timestamp);
            }
            return post;
          });
        })
      );
  }
  
  
}
