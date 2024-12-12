require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Utilisateurs',
      version: '1.0.0',
      description: 'API pour gérer les utilisateurs (CRUD)',
    },
    servers: [
      {
        url: 'http://localhost:9000',
        description: 'Serveur local',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: "Identifiant unique de l'utilisateur",
              example: '64f74c8e524a1c0012a34567',
            },
            name: {
              type: 'string',
              description: "Nom de l'utilisateur",
              example: 'John Doe',
            },
            email: {
              type: 'string',
              description: "Email de l'utilisateur",
              example: 'johndoe@example.com',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: "Date de naissance de l'utilisateur",
              example: '1990-01-01',
            },
          },
        },
      },
    },
  },
  apis: ['./index.js'], // Fichiers contenant les annotations Swagger
};



mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connection has been established successfully');
    })
    .catch((error) => {
        console.error('❌ Unable to connect to the database: ', error);
    });

// Définition du schéma
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
  });
  
  // Création du modèle
  const User = mongoose.model('User', userSchema);


const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Bienvenue dans l\'API Client');
});


// Initialisation Swagger
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


//*********************************Create user********************************************************************** */

/**
 * @swagger
 * /createUser:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     description: Permet de créer un utilisateur avec un nom, un email et une date de naissance.
 *     tags:
 *       - Utilisateurs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'utilisateur
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: Email de l'utilisateur
 *                 example: johndoe@example.com
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Date de naissance de l'utilisateur (format ISO 8601)
 *                 example: 1990-01-01
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Requête invalide (champs manquants ou mal formés)
 *       500:
 *         description: Erreur serveur
 */
app.post('/createUser', async (req, res) => {
  try {
    const { name, email, dateOfBirth } = req.body;

    // Validation
    if (!name || !email || !dateOfBirth) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Création
    const newUser = new User({ name, email, dateOfBirth });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user', error });
  }
});


//*********************************Delete user********************************************************************** */

/**
 * @swagger
 * /deleteUser/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Supprime un utilisateur en fonction de son ID.
 *     tags:
 *       - Utilisateurs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant unique de l'utilisateur à supprimer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur introuvable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Erreur serveur
 */



app.delete('/deleteUser/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Suppression avec la methode mangoosse
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

//*********************************Update user********************************************************************** */


/**
 * @swagger
 * /updateUser/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     description: Met à jour les informations d'un utilisateur en fonction de son ID.
 *     tags:
 *       - Utilisateurs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant unique de l'utilisateur à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nouveau nom de l'utilisateur
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 description: Nouvel email de l'utilisateur
 *                 example: janedoe@example.com
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Nouvelle date de naissance (format ISO 8601)
 *                 example: 1992-05-15
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Format de l'ID invalide ou données manquantes
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */



app.put('/updateUser/:id', async (req, res) => {
  try {
    const { id } = req.params; // Récupèration de l'id
    const { name, email, dateOfBirth } = req.body; // Champs à mettre à jour

    // si l'id est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Mise à jour de l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, dateOfBirth }, // Les champs à mettre à jour
      { new: true, runValidators: true } // Options : retourne le document mis à jour et applique les validateurs
    );

    // Si le user n'existe pas
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user', error });
  }
});


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     description: Renvoie une liste de tous les utilisateurs existants dans la base de données.
*     tags:
 *       - Utilisateurs
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Erreur serveur
 */
app.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Récupérer tous les utilisateurs
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving users', error });
  }
});

