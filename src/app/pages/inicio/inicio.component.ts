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
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
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
export class InicioComponent implements OnInit, OnDestroy, AfterViewInit{

  //TODO
  showOverlay: boolean = true;
  componentLoaded: boolean = false;
  isMuted: boolean = false;
  audio: any;
  formatAudioTime: any = '00:00';
  formatAudioEnd: any = '-00:00';

  duration: any;
  timer: any;
  percentage: any;

  days: any;
  hours: any;
  minutes: any;
  seconds: any;
  countdownDate: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private apiService: ApiServiceService
  ) {}

  ngOnInit(): void {

    //aos
    AOS.init();
    window.addEventListener('load', AOS.refresh);
    //

    this.disableScroll();
    window.scrollTo(0, 0);

    this.countdownDate = new Date('2025-09-27T16:00:00').getTime();
    // Immediately update countdown when component initializes
    this.updateCountdownDays();

    // Update countdown every second
    setInterval(() => {
      this.updateCountdownDays();
    }, 1000);

    // Asegurar que el overlay esté visible inmediatamente
    this.showOverlay = true;
    this.componentLoaded = false;

  }

  ngAfterViewInit() {
    this.scrollTop();
  }

  ngOnDestroy(): void {
    
  }

  scrollTop(){
    // Múltiples métodos para asegurar que el scroll funcione en todos los navegadores
    setTimeout(() => {
      // Método 1: window.scrollTo
      window.scrollTo(0, 0);
      
      // Método 2: document.documentElement.scrollTop
      document.documentElement.scrollTop = 0;
      
      // Método 3: document.body.scrollTop (para navegadores más antiguos)
      document.body.scrollTop = 0;
      
      // Método 4: scrollIntoView
      document.body.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }

  disableScroll() {
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  enableScroll() {
    this.renderer.removeStyle(document.body, 'overflow');
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

  hideOverlay() {
    this.playSound();
    this.showOverlay = false;
    
    // Marcar el componente como cargado después de ocultar el overlay
    setTimeout(() => {
      this.componentLoaded = true;
      this.enableScroll();
      this.scrollTop();
    }, 50);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    
    // Si el audio no está inicializado, inicializarlo
    if (!this.audio) {
      this.playSound();
    } else {
      this.audio.muted = this.isMuted;
    }
    
    this.applyMuteState();
  }

  applyMuteState() {
    if (this.audio && this.audio.readyState >= 1) {
      this.audio.muted = this.isMuted;
    }
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

}
