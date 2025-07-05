import { Component, OnDestroy, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, HostListener, Renderer2 } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import 'hammerjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
//
import { NgxGalleryOptions } from '@rybos/ngx-gallery';
import { NgxGalleryImage } from '@rybos/ngx-gallery';
import { NgxGalleryAnimation } from '@rybos/ngx-gallery';
//
import { ApiServiceService } from '../../services/api-service.service';
import { HttpResponse } from '@angular/common/http';
//

//aos
import * as AOS from 'aos';
//

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in')
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy{
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];
  //
  @ViewChild('hiddenButton', { static: true }) hiddenButton!: ElementRef<HTMLDivElement>;

  audio: any;
  formatAudioTime: any = '00:00';
  formatAudioEnd: any = '-00:00';

  duration: any;
  timer: any;
  percentage: any;
  //


  countdownDate: any;
  days: any;
  hours: any;
  minutes: any;
  seconds: any;

  mostrarInvitacionPrincipal: boolean = true;

  //TODO
  showOverlay: boolean = true;
  //
  _inputNombre: string = "";
  _inputCelular: string = "";
  _inputAsistencia: string = "";
  _inputMensaje: string = "";

  //audio volumen
  isMuted = false;
  //audio: HTMLAudioElement;

  constructor(
    private cdr: ChangeDetectorRef,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private apiService: ApiServiceService
  ) {}

  hideOverlay() {
    this.playSound();
    this.showOverlay = false;
    this.enableScroll();
  }

  disableScroll() {
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  enableScroll() {
    this.renderer.removeStyle(document.body, 'overflow');
  }

  ingresar(){
    this.mostrarInvitacionPrincipal = true;
    this.playSound();
  }

  ngOnInit(): void {
    //aos
    AOS.init();
    window.addEventListener('load', AOS.refresh);
    //

    this.disableScroll();
    window.scrollTo(0, 0);

    this.countdownDate = new Date('2025-09-07T16:00:00').getTime();
    // Immediately update countdown when component initializes
    this.updateCountdownDays();

    // Update countdown every second
    setInterval(() => {
      this.updateCountdownDays();
    }, 1000);


    this.galleryOptions = [
      {
        width: '600px',
        height: '800px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        imageAutoPlay: false,
        imageSwipe: true,
        imageInfinityMove: true,
        fullWidth: true
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '600px',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false
      }
    ];

    this.galleryImages = [
      {
        small: 'assets/img/gallery/temp-1.jpg',
        medium: 'assets/img/gallery/temp-1.jpg',
        big: 'assets/img/gallery/temp-1.jpg'
      },
      {
        small: 'assets/img/gallery/temp-2.jpg',
        medium: 'assets/img/gallery/temp-2.jpg',
        big: 'assets/img/gallery/temp-2.jpg'
      },
      {
        small: 'assets/img/gallery/temp-3.jpg',
        medium: 'assets/img/gallery/temp-3.jpg',
        big: 'assets/img/gallery/temp-3.jpg'
      },{
        small: 'assets/img/gallery/temp-4.jpg',
        medium: 'assets/img/gallery/temp-4.jpg',
        big: 'assets/img/gallery/temp-4.jpg'
      },
      {
        small: 'assets/img/gallery/temp-5.jpg',
        medium: 'assets/img/gallery/temp-5.jpg',
        big: 'assets/img/gallery/temp-5.jpg'
      }
    ];

  }

  updateCountdownDays() {
    const now = new Date().getTime();
    const distance = this.countdownDate - now;

    this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Ensure countdown doesn't go below zero
    if (distance < 0) {
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
    }

  }

  validateNumber(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  validateNombre(event: KeyboardEvent): void {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // Prevent the default action (character insertion)
      event.preventDefault();
    }
  }


  scrollTop(){
    setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  }

  ngAfterViewInit() {
    this.scrollTop();
    
  }


  playSound() {
    this.audio = new Audio();
    this.audio.src = "../assets/audio/audio.mp3";
    // Asegurarse de que la metadata esté cargada antes de reproducir
    this.audio.addEventListener('loadedmetadata', () => {
      this.applyMuteState();
      this.audio.play();
      this.startTimer(); // Comenzar el temporizador para actualizar el tiempo cada segundo
    });

    // Aplicar el estado de mute cada vez que el audio empieza a reproducirse
    this.audio.addEventListener('play', () => {
      this.applyMuteState();
    });
  
    // Reiniciar la reproducción cuando termine el audio
    this.audio.addEventListener('ended', () => {
      clearInterval(this.timer); // Limpiar el intervalo existente
      this.playSound(); // Llamada recursiva para reiniciar la reproducción
    });
  
    // Cargar el audio
    this.audio.load();
  }
  
  startTimer() {
    // Limpiar cualquier intervalo existente
    clearInterval(this.timer);
  
    // Comenzar un nuevo intervalo para actualizar el tiempo cada segundo
    this.timer = setInterval(() => {
      this.calcularTime();
    }, 1000);
  }
  
  calcularTime() {
    const { currentTime, duration } = this.audio;
    this.tiempoTranscurrido(currentTime);
    this.tiempoRestante(currentTime, duration);
    this.setPercentage(currentTime, duration)
  }
  
  tiempoTranscurrido(currentTime: number) {
    let seconds = Math.floor(currentTime % 60);
    let minutes = Math.floor((currentTime / 60) % 60);
  
    const displaySeconds = (seconds < 10) ? `0${seconds}` : seconds;
    const displayMinutes = (minutes < 10) ? `0${minutes}` : minutes;
    this.formatAudioTime = `${displayMinutes}:${displaySeconds}`;
  }
  
  tiempoRestante(currentTime: number, duration: number): void {
    let timeLeft = duration - currentTime;
    let seconds = Math.floor(timeLeft % 60);
    let minutes = Math.floor((timeLeft / 60) % 60);
    const displaySeconds = (seconds < 10) ? `0${seconds}` : seconds;
    const displayMinutes = (minutes < 10) ? `0${minutes}` : minutes;
    this.formatAudioEnd = `-${displayMinutes}:${displaySeconds}`;
  }

  private setPercentage(currentTime: number, duration: number): void {
    this.percentage = (currentTime * 100) / duration;
    //console.log("% del tiempo...", this.percentage);
  }

  

  initAudio() {
    // Simular interacción del usuario haciendo clic en algún lugar del componente
    this.elRef.nativeElement.click();

    // Iniciar la reproducción del audio después de un breve retraso
    setTimeout(() => {
      this.playSound();
    }, 200);
  }

  // Método para cambiar el volumen del audio
  changeVolume(volume: number) {
    this.audio.volume = volume;
  }

  ngOnDestroy(): void {
    
  }

    
  showCancionesForm() {
    Swal.fire({
      title: "Ingresa el nombre de la canción y el cantante 😎 🎶",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
        autocomplete: "off",
        maxlength: "50"
      },
      showCancelButton: true,
      confirmButtonText: "Registrar",
      showLoaderOnConfirm: true,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#202020",
      preConfirm: async (nombre_autor) => {
        if (!nombre_autor || nombre_autor.trim() === "") {
          Swal.fire({
            icon: 'error',
            title: 'Recuerde ingresar su canción y el cantante',
            showConfirmButton: true,
            showCloseButton: false,
            confirmButtonColor: '#202020'
          });
          return false; 
        }
  
        try {
          const url = `https://alvaro-y-aylin.com/api/send_music.php`;
          const _nombre_autor = { nombre_autor };
  
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(_nombre_autor)
          });
  
          if (!response.ok) {
            const error = await response.json();
            return Swal.showValidationMessage(
              `Error: ${JSON.stringify(error)}`
            );
          }
  
          return response.json();
        } catch (error) {
          Swal.showValidationMessage(`No se pudo guardar tus datos`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire({
          icon: 'success',
          title: 'Tu música fue registrada, te esperamos el 07 de Setiembre ❤️',
          showConfirmButton: true,
          showCloseButton: false,
          confirmButtonColor: '#202020'
        });
      }
    });
  }





  confirmar(){
    Swal.fire({
      icon: 'warning',
      title: "¿Deseas Confirmar tu invitación?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "confirmar",
      cancelButtonText: 'Aún no',
      confirmButtonColor: '#202020'
    }).then((result) => {

      if (result.isConfirmed) {

        if(this._inputNombre == ""){
          Swal.fire({
            icon: 'error',
            title: 'Recuerde ingresar su nombre',
            showConfirmButton: true,
            showCloseButton: false,
            confirmButtonColor: '#202020'
          });
          return;
        }

        if(this._inputCelular == ""){
          Swal.fire({
            icon: 'error',
            title: 'Recuerde ingresar su celular',
            showConfirmButton: true,
            showCloseButton: false,
            confirmButtonColor: '#202020'
          });
          return;
        }

        if(this._inputAsistencia == ""){
          Swal.fire({
            icon: 'error',
            title: 'Recuerde seleccionar si podrá asistir a nuestra boda',
            showConfirmButton: true,
            showCloseButton: false,
            confirmButtonColor: '#202020'
          });
          return;
        }



        const data = {
          nombre: this._inputNombre,
          celular: this._inputCelular,
          asistencia: this._inputAsistencia,
          mensaje: this._inputMensaje
        }

        this.apiService.registerData(data).subscribe(
          (response: HttpResponse<any>) => {
            if (response.status == 201){

             Swal.fire({
              icon: 'success',
              title: 'Asistencia confirmada',
              showConfirmButton: true,
              showCloseButton: false,
              confirmButtonColor: '#202020'
            });

            this._inputNombre = "";
            this._inputCelular = "";
            this._inputAsistencia = "";
            this._inputMensaje = "";

            }
            console.log("response...", response);
          },
          (error: any) => {
            console.log("error...", error);
          }
        );


      } else if (result.isDenied) {
        
      }

    });
  }



  //
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    this.applyMuteState();
  }

  applyMuteState() {
    if (this.audio) {
      this.audio.muted = this.isMuted;
    }
  }

}
