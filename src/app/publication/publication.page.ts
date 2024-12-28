import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Post, PublicationService } from '../services/publication.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-publication',
  templateUrl: './publication.page.html',
  styleUrls: ['./publication.page.scss'],
})
export class PublicationPage {
  content: string = '';
  currentUserId: string = '';

  constructor(private publicationService: PublicationService, private authService: AuthService, private router: Router)
   { this.authService.getAuthState().subscribe((user) => {
    if (user) {
      this.currentUserId = user.uid;
    }
  });}

  imageFile: File | null = null;

handleImageInput(event: any) {
  this.imageFile = event.target.files[0];
}

addPost() {
  if (!this.content.trim() && !this.imageFile) {
    alert('You must add some content or select an image.');
    return;
  }

  const uploadTask = this.imageFile
    ? this.publicationService.uploadImage(this.imageFile)
    : Promise.resolve('');

  uploadTask.then((imageUrl) => {
    const post: Post = {
      authorId: this.currentUserId, // Identifiant de l'auteur
      content: this.content,
      imageUrl: imageUrl || undefined, // Définit undefined si aucune image
      likes: 0,
      comments: [],
      timestamp: new Date(),
    };

    this.publicationService.addPost(post).then(() => {
      console.log('Post added successfully!');
      this.router.navigate(['/home']);
    });
  }).catch((error) => {
    console.error('Error uploading image:', error);
  });
}


}


