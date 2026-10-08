import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarNavigation } from '../../components/sidebar-navigation/sidebar-navigation';
import { Toolbar } from '../../components/toolbar/toolbar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarNavigation, Toolbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {}
