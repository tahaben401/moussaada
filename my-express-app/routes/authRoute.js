import { Router } from "express";
import verifySession from "../middleware/authMiddleware.js";
import bcrypt from 'bcrypt'
import supabase from "../config/supabase.js";
const userRoute=Router();

userRoute.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

   
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, fullname, password,role')
      .eq('email', email)
      .single();

    if (error) throw error;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    delete user.password;
    
    req.session.regenerate((err) => {
      if (err) throw err;
      
      req.session.user = {
        id: user.id,
        email: user.email
      };
      
      res.status(200).json({
        message: 'Login successful',
        user: user
      });
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'An error occurred during login',
      details:err.message 
    });
  }
});
  userRoute.post('/signup', async (req, res) => {
    try {
      const { email, password, fullname } = req.body;
  
     
      if (!email || !password || !fullname) {
        return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
      }
  
     
      const { data: existingUser, error: lookupError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();
  
      if (existingUser) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
      }
  
     
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
     
  
      
      const {data:user, error: dbError } = await supabase
        .from('users')
        .insert({ 
          email,
          fullname,
          password: hashedPassword 
        });
  
      if (dbError) throw dbError;
  
      
      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: {
          id,
          email,
          fullname
        }
      });
  
    } catch (err) {
      console.error('Erreur inscription:', err);
      res.status(500).json({ 
        error: 'Une erreur est survenue lors de l\'inscription',
        details: err.message 
      });
    }
  
      
  });
  userRoute.get('/dashboard', verifySession, (req, res) => {
    res.json({ user: req.user });
  });



export default userRoute;