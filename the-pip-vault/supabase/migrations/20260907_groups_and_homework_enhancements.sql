-- Migration: Groups, Homework & Notifications Enhancements
-- Date: 2026-09-07

-- 1. Ensure description exists on groups table
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS description text;

-- 2. Ensure guidelines exists on homework table
ALTER TABLE public.homework 
ADD COLUMN IF NOT EXISTS guidelines text;

-- 3. Create notifications table for student status updates
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'homework',
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (e.g. mark as read)" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Service and authenticated users can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);
