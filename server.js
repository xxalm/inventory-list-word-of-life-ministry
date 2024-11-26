const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Inicializar o app
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Conexão com o MongoDB
mongoose.connect(
    `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`
)
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Middleware para verificar o token do administrador
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer token"

    if (!token) {
        return res.status(401).send('Token não fornecido.');
    }

    try {
        const decoded = jwt.verify(token, 'chaveSecreta'); // Substitua por uma chave secreta segura
        if (decoded.role !== 'admin') {
            return res.status(403).send('Acesso negado. Apenas administradores podem realizar esta ação.');
        }
        next();
    } catch (err) {
        res.status(401).send('Token inválido.');
    }
};

// Modelo para os itens
const Item = mongoose.model('Item', new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, default: 0 },
}));

// Rota para obter a lista de itens
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        console.error('Erro ao obter itens:', err);
        res.status(500).send('Erro ao obter itens.');
    }
});

// Rota para cadastrar itens (apenas para admin)
app.post('/api/items', verifyAdmin, async (req, res) => {
    const { name, image, quantity } = req.body;

    if (!name || !image) {
        return res.status(400).send('Nome e imagem são obrigatórios.');
    }

    try {
        const newItem = new Item({ name, image, quantity });
        await newItem.save();
        res.status(201).send('Item criado com sucesso.');
    } catch (err) {
        console.error('Erro ao criar item:', err);
        res.status(500).send('Erro ao criar item.');
    }
});

// Rota para processar a seleção do usuário
app.post('/api/submit', async (req, res) => {
    const { email, selectedItems } = req.body;

    if (!email || !selectedItems || selectedItems.length === 0) {
        return res.status(400).send('Email e itens selecionados são obrigatórios.');
    }

    try {
        // Verificar se os itens existem e têm estoque suficiente
        const items = await Item.find({ _id: { $in: selectedItems.map(si => si.id) } });
        const insufficientStock = [];

        selectedItems.forEach(selected => {
            const item = items.find(i => i._id.toString() === selected.id);
            if (!item || item.quantity < selected.quantity) {
                insufficientStock.push({
                    item: item?.name || 'Item não encontrado',
                    available: item?.quantity || 0,
                });
            }
        });

        if (insufficientStock.length > 0) {
            return res.status(400).json({
                message: 'Alguns itens não têm estoque suficiente.',
                details: insufficientStock,
            });
        }

        // Atualizar a quantidade de cada item no banco
        const updatePromises = selectedItems.map(selected => {
            return Item.findByIdAndUpdate(
                selected.id,
                { $inc: { quantity: -selected.quantity } }, // Decrementa o estoque
                { new: true }
            );
        });
        await Promise.all(updatePromises);

        // Enviar email de confirmação
        await sendConfirmationEmail(email, items);
        res.status(200).send('Email enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao processar envio de email:', error);
        res.status(500).send('Erro ao enviar email.');
    }
});

// Função para enviar email de confirmação
async function sendConfirmationEmail(email, items) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const itemNames = items.map(item => `${item.name} (${item.quantity})`).join(', ');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Confirmação de Seleção de Itens',
        text: `Você escolheu os seguintes itens: ${itemNames}`,
    };

    await transporter.sendMail(mailOptions);
}

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
