import { Component, OnInit } from '@angular/core';
import {
  PublicationService,
  Post,
  User,
} from '../services/publication.service';
import { AlertController } from '@ionic/angular';
import { Share } from '@capacitor/share';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  posts: Post[] = []; // Liste des publications

  constructor(
    private publicationService: PublicationService,
    private alertController: AlertController
  ) {}

  // ngOnInit() {
  //   // Charger les publications
  //   this.publicationService.getPosts().subscribe((posts) => {
  //     this.posts = posts.map((post: Post) => {
  //       // Récupérer les informations de l'utilisateur pour chaque publication
  //       this.publicationService.getUser(post.authorId).subscribe((user: User | undefined) => {
  //         if (user) {
  //           post.author = user; // Associe l'objet User complet à post.author
  //           post.userHasLiked = post.likedBy?.includes('current-user-id'); // Vérifie si l'utilisateur a liké
  //         }
  //       });
  //       return post;
  //     });
  //   });
  // }
  // ngOnInit() {
  //   this.publicationService.getPosts().subscribe((posts) => {
  //     this.posts = posts.map((post: Post) => {
  //       // Récupérer les informations de l'auteur et traiter les likes
  //       this.publicationService.getUser(post.authorId).subscribe((user) => {
  //         if (user) {
  //           post.author = user;
  //           post.userHasLiked = post.likedBy?.includes('current-user-id') || false; // Vérifie si l'utilisateur a liké
  //         }
  //       });

  //       // Initialiser likedBy si non défini
  //       if (!post.likedBy) {
  //         post.likedBy = [];
  //       }

  //       return post;
  //     });
  //   });
  // }

  ngOnInit() {
    this.publicationService.getPosts().subscribe((posts) => {
      this.posts = posts.map((post: Post) => {
        post.relativeTime = this.getRelativeTime(post.timestamp);
        // Récupérer les informations de l'utilisateur pour chaque publication
        this.publicationService.getUser(post.authorId).subscribe((user) => {
          if (user) {
            post.author = {
              firstName: user.firstName,
              lastName: user.lastName,
              institution: user.institution || 'No Institution',
              photoURL: user.photoURL,
            }; // Associe les informations de l'auteur
          }
        });

        // Initialiser likedBy si non défini
        if (!post.likedBy) {
          post.likedBy = [];
        }

        return post;
      });
    });
    setInterval(() => {
      this.posts.forEach((post) => {
        post.relativeTime = this.getRelativeTime(post.timestamp);
      });
    }, 60000);
  }

  // Met à jour le temps relatif toutes les minutes
  getRelativeTime(timestamp: any): string {
    if (!(timestamp instanceof Date)) {
      console.error('Invalid timestamp:', timestamp);
      return 'Date invalide';
    }
  
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  
    if (diffInSeconds < 60) {
      return `il y a ${diffInSeconds} seconde${diffInSeconds > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  }
  
  
  

  // Méthode pour ajouter un commentaire
  async addComment(post: Post) {
    const alert = await this.alertController.create({
      header: 'Add Comment',
      inputs: [
        {
          name: 'comment',
          type: 'text',
          placeholder: 'Write your comment...',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Post',
          handler: (data) => {
            if (data.comment.trim()) {
              this.publicationService
                .addComment(post.id!, data.comment)
                .then(() => {
                  // Mise à jour locale des commentaires
                  post.comments = post.comments || [];
                  post.comments.push(data.comment);
                  console.log('Comment added successfully');
                });
            }
          },
        },
      ],
    });

    await alert.present();
  }

  // Méthode pour liker une publication
  likePost(post: Post) {
    if (!post.userHasLiked) {
      this.publicationService.likePost(post.id!).then(() => {
        post.userHasLiked = true; // Marque comme liké pour l'utilisateur actuel
        post.likedBy = post.likedBy || []; // Initialise likedBy si nécessaire
        post.likedBy.push('current-user-id'); // Ajoute l'utilisateur actuel à la liste des likes
      });
    }
  }

  // Méthode pour partager une publication
  async sharePost(post: Post) {
    try {
      await Share.share({
        title: 'Check out this post!',
        text: post.content,
        url: post.imageUrl || '',
        dialogTitle: 'Share this post',
      });
    } catch (err) {
      console.error('Error sharing post:', err);
    }
  }
}
