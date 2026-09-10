-- Migration: Enable Cascade Deletion across all user-related tables
-- Date: 2026-09-10
-- Purpose: Ensures deleting a user automatically cascades cleanly without constraint violations.

-- 1. Profiles -> Auth Users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
  
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id)
    ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'profiles_id_fkey update skipped or failed: %', SQLERRM;
END $$;

-- 2. Profiles -> Groups (ON DELETE SET NULL so deleting a group unlinks users)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_group_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_group_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'group_id'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES public.groups(id)
      ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'profiles_group_id_fkey update skipped: %', SQLERRM;
END $$;

-- 3. Accounts -> Auth Users / Profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'accounts_user_id_fkey' AND table_name = 'accounts'
  ) THEN
    ALTER TABLE public.accounts DROP CONSTRAINT accounts_user_id_fkey;
  END IF;

  ALTER TABLE public.accounts
    ADD CONSTRAINT accounts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
    ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'accounts_user_id_fkey update skipped: %', SQLERRM;
END $$;

-- 4. Trades -> Auth Users & Accounts
DO $$
BEGIN
  -- user_id FK
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'trades_user_id_fkey' AND table_name = 'trades'
  ) THEN
    ALTER TABLE public.trades DROP CONSTRAINT trades_user_id_fkey;
  END IF;

  ALTER TABLE public.trades
    ADD CONSTRAINT trades_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
    ON DELETE CASCADE;

  -- account_id FK
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'trades_account_id_fkey' AND table_name = 'trades'
  ) THEN
    ALTER TABLE public.trades DROP CONSTRAINT trades_account_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trades' AND column_name = 'account_id'
  ) THEN
    ALTER TABLE public.trades
      ADD CONSTRAINT trades_account_id_fkey
      FOREIGN KEY (account_id) REFERENCES public.accounts(id)
      ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'trades FK update skipped: %', SQLERRM;
END $$;

-- 5. Groups -> Mentor / Owner
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'groups_mentor_id_fkey' AND table_name = 'groups'
  ) THEN
    ALTER TABLE public.groups DROP CONSTRAINT groups_mentor_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'groups_owner_id_fkey' AND table_name = 'groups'
  ) THEN
    ALTER TABLE public.groups DROP CONSTRAINT groups_owner_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'groups' AND column_name = 'mentor_id'
  ) THEN
    ALTER TABLE public.groups
      ADD CONSTRAINT groups_mentor_id_fkey
      FOREIGN KEY (mentor_id) REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'groups' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.groups
      ADD CONSTRAINT groups_owner_id_fkey
      FOREIGN KEY (owner_id) REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'groups FK update skipped: %', SQLERRM;
END $$;

-- 6. Homework -> Group & Student
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'homework_group_id_fkey' AND table_name = 'homework'
  ) THEN
    ALTER TABLE public.homework DROP CONSTRAINT homework_group_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'homework' AND column_name = 'group_id'
  ) THEN
    ALTER TABLE public.homework
      ADD CONSTRAINT homework_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES public.groups(id)
      ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'homework_student_id_fkey' AND table_name = 'homework'
  ) THEN
    ALTER TABLE public.homework DROP CONSTRAINT homework_student_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'homework' AND column_name = 'student_id'
  ) THEN
    ALTER TABLE public.homework
      ADD CONSTRAINT homework_student_id_fkey
      FOREIGN KEY (student_id) REFERENCES auth.users(id)
      ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'homework FK update skipped: %', SQLERRM;
END $$;

-- 7. Homework Submissions -> Homework & Student
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'homework_submissions_homework_id_fkey' AND table_name = 'homework_submissions'
  ) THEN
    ALTER TABLE public.homework_submissions DROP CONSTRAINT homework_submissions_homework_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'homework_submissions' AND column_name = 'homework_id'
  ) THEN
    ALTER TABLE public.homework_submissions
      ADD CONSTRAINT homework_submissions_homework_id_fkey
      FOREIGN KEY (homework_id) REFERENCES public.homework(id)
      ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'homework_submissions_student_id_fkey' AND table_name = 'homework_submissions'
  ) THEN
    ALTER TABLE public.homework_submissions DROP CONSTRAINT homework_submissions_student_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'homework_submissions' AND column_name = 'student_id'
  ) THEN
    ALTER TABLE public.homework_submissions
      ADD CONSTRAINT homework_submissions_student_id_fkey
      FOREIGN KEY (student_id) REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'homework_submissions FK update skipped: %', SQLERRM;
END $$;
