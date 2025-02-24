const express = require('express');
const mysql = require('mysql2');
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require("firebase/firestore");

const app = express();
const port = 5001;

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBzzWzkC5KkDgpx2Nev4fudN_Y7JwSwG4A",
    authDomain: "horas-cfa22.firebaseapp.com",
    projectId: "horas-cfa22",
    storageBucket: "horas-cfa22.appspot.com",
    messagingSenderId: "652408562618",
    appId: "1:652408562618:web:76a48091b863b6a976f383",
    measurementId: "G-8B20589LE9"
};

// Inicialize o Firebase
const firebaseApp = initializeApp(firebaseConfig);
const dbFirestore = getFirestore(firebaseApp);

// Configuração do MySQL
const dbMySQL = mysql.createConnection({
    host: '127.0.0.1', // ou o endereço do seu banco de dados
    user: 'root', // usuário do MySQL
    password: '123456789', // senha do MySQL
    database: 'atividades_db'
});

// Conectar ao MySQL
dbMySQL.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
    } else {
        console.log('Conectado ao MySQL');
    }
});

// Middleware para permitir requisições JSON
app.use(express.json());

// Rota para obter todas as atividades (do Firebase e do MySQL)
app.get('/atividades', async (req, res) => {
    try {
        // Obter atividades do Firebase
        const querySnapshot = await getDocs(collection(dbFirestore, "atividades"));
        const atividadesFirestore = [];
        querySnapshot.forEach((doc) => {
            atividadesFirestore.push({ id: doc.id, ...doc.data() });
        });

        // Obter atividades do MySQL
        const [atividadesMySQL] = await dbMySQL.promise().query('SELECT * FROM atividades');

        // Combinar resultados
        const atividades = [...atividadesFirestore, ...atividadesMySQL];
        res.json(atividades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para salvar uma nova atividade (no Firebase e no MySQL)
app.post('/atividades', async (req, res) => {
    try {
        const { descricao, categoria, tipo_especifico, horas } = req.body;

        // Salvar no Firebase
        const docRef = await addDoc(collection(dbFirestore, "atividades"), {
            descricao,
            categoria,
            tipo_especifico,
            horas
        });

        // Salvar no MySQL
        const query = 'INSERT INTO atividades (descricao, categoria, tipo_especifico, horas) VALUES (?, ?, ?, ?)';
        const [result] = await dbMySQL.promise().query(query, [descricao, categoria, tipo_especifico, horas]);

        res.status(201).json({ id: docRef.id, mysqlId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para excluir uma atividade (do Firebase e do MySQL)
app.delete('/atividades/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Excluir do Firebase
        await deleteDoc(doc(dbFirestore, "atividades", id));

        // Excluir do MySQL
        const query = 'DELETE FROM atividades WHERE id = ?';
        await dbMySQL.promise().query(query, [id]);

        res.status(200).json({ message: "Atividade excluída com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});