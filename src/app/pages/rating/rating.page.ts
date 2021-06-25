import { Component, OnInit, ViewChild } from '@angular/core';
import { Order } from 'src/app/models/app/order';
import { ActivatedRoute, Router } from '@angular/router';
import { IonSlides, LoadingController, AlertController } from '@ionic/angular';
import { QuestionsService } from 'src/app/services/questions.service';
import { Observable } from 'rxjs';
import { Questions } from 'src/app/models/app/question';
import { ResponseService } from 'src/app/services/response.service';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.page.html',
  styleUrls: ['./rating.page.scss'],
})
export class RatingPage implements OnInit {

  @ViewChild(IonSlides) slides: IonSlides;

  slideOpts = {
    initialSlide: 0,
  };

  private orderId: Order["uid"];
  progress = 0;
  questions: Observable<Questions["questions"]>;
  private answers = [];
  endSurvey = false;
  completed = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private questionsService: QuestionsService,
    private responsesService: ResponseService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router,
  ) {

    // questionsService.getQuestions().subscribe(questions => {
    //   console.log(questions);
    // });
  }

  ngOnInit() {
    this.orderId = this.activatedRoute.snapshot.paramMap.get('orderId');
    this.questions = this.questionsService.getQuestions();
  }

  async ionViewDidEnter() {
    this.slides.lockSwipes(true);
    setTimeout(() => {
      this.updateProgress();
    }, 300);
  }

  async updateProgress() {
    let slidesLen = await this.slides.length();
    let slideIndex = await this.slides.getActiveIndex();

    this.progress = (slideIndex + 1) / slidesLen;

    if (this.progress === 1) {
      this.endSurvey = true;
    }
  }

  slideChange() {
    this.updateProgress();
  }

  nextQuestion() {
    this.slides.lockSwipes(false);
    this.slides.slideNext();
    this.slides.lockSwipes(true);
    this.completed = false;
  }

  rateChange(index: number, question: string, rating: number) {
    this.answers[index] = {
      question: question,
      rating: rating
    };

    this.completed = true;
  }

  async calificar() {

    this.loadingController.create()
      .then(loading => {
        loading.present();

        let res = {
          orderUid: this.orderId,
          responses: this.answers
        }
        this.responsesService.addResponse(res)
          .then((res) => {
            this.presentAlert(`¡Genial!`, res);
          })
          .catch((error) => {
            this.presentAlert(`Error`, `Ocurrió un error`);
            console.log(error);
          })
          .finally(() => {
            loading.dismiss();
            setTimeout(() => {
              this.router.navigate(["/app/servicios"]);
            }, 1500);
          });
      });

  }

  async presentAlert(hdr, msg) {
    const alert = await this.alertController.create({
      header: hdr,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }


}
