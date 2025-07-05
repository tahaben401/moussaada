import { Router } from "express";
import supabase from "../config/supabase.js";
import verifySession from "../middleware/authMiddleware.js";
const ticketRoute=Router();
ticketRoute.get('/' ,async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (error) throw error;
  
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});
ticketRoute.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();
  
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Ticket not found' });
  
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});
ticketRoute.post('/create', async (req, res) => {
    try {
      const {
        fullName,
        email,
        departement,
        requestNature,
        requestType,
        requestSubType,
        priority,
        description
      } = req.body;
  
      if (!fullName || !email || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
  
      const { data, error } = await supabase
        .from('tickets')
        .insert([{
          full_name: fullName,
          email:email,
          departement:departement,
          request_nature: requestNature,
          request_type: requestType,
          request_sub_type: requestSubType,
          priority:priority,
          description:description,
          status: 'open',
          ticket_number:ticketNumber
        }])
        .select();
  
      if (error) throw error;
  
      res.status(201).json({
        message: 'Ticket created successfully',
        ticket: data[0],
        ticketNumber:ticketNumber
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  ticketRoute.post('/update/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
  
     
      delete updates.id;
      delete updates.ticket_number;
      delete updates.created_at;
  
      
      updates.updated_at = new Date().toISOString();
  
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select();
  
      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
  
      res.status(200).json({
        message: 'Ticket updated successfully',
        ticket: data[0]
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
ticketRoute.post('/delete/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);
  
      if (error) throw error;
  
      res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
ticketRoute.post('/update/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
  
      
      delete updates.id;
      delete updates.ticket_number;
      delete updates.created_at;
  
      
      updates.updated_at = new Date().toISOString();
  
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select();
  
      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
  
      res.status(200).json({
        message: 'Ticket updated successfully',
        ticket: data[0]
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  ticketRoute.post('/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, assigned_to, resolution_notes } = req.body;
  
      const updates = {
        status,
        updated_at: new Date().toISOString()
      };
  
      if (assigned_to) updates.assigned_to = assigned_to;
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        updates.resolution_notes = resolution_notes || '';
      }
  
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select();
  
      if (error) throw error;
  
      res.status(200).json({
        message: 'Ticket status updated',
        ticket: data[0]
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

export default ticketRoute;
