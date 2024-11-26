import { Component } from '@angular/core';
import { ItemListComponent } from './components/item-list/item-list.component'; // Importa o ItemListComponent
import { CommonModule } from '@angular/common'; // Importa CommonModule para usar ngIf, ngFor
import { HttpClientModule } from '@angular/common/http'; // Se você for fazer requisições HTTP
import { FormsModule } from '@angular/forms'; // Para manipulação de formulários

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true, // Define que o AppComponent é standalone
  imports: [
    CommonModule, // Necessário para usar diretivas como ngIf, ngFor
    HttpClientModule, // Para requisições HTTP
    FormsModule, // Para manipulação de formulários
    ItemListComponent // Importa o ItemListComponent diretamente
  ]
})
export class AppComponent {
  title = 'lista-de-itens-frontend';
}
