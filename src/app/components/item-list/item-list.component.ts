import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Item } from './item.model'; // Certifique-se de que o caminho está correto

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {

  items: Item[] = []; // Agora items é tipado como um array de Item
  selectedQuantities: { [key: string]: number } = {}; // Definindo a variável para armazenar as quantidades

  ngOnInit(): void {
    // Lógica para inicializar a lista de itens (substitua com dados reais)
    this.items = [
      { _id: '1', name: 'Item 1', image: 'image1.jpg', quantity: 10 },
      { _id: '2', name: 'Item 2', image: 'image2.jpg', quantity: 5 }
    ];
  }

  submitItems(): void {
    // Função para enviar os itens selecionados
    console.log(this.selectedQuantities);
  }
}
