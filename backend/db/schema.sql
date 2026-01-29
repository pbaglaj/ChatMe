--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2026-01-21 17:58:51
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 24599)
-- Name: friends; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.friends (
    id integer NOT NULL,
    user_id integer NOT NULL,
    friend_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 219 (class 1259 OID 24598)
-- Name: friends_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.friends_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4928 (class 0 OID 0)
-- Dependencies: 219
-- Name: friends_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.friends_id_seq OWNED BY public.friends.id;


--
-- TOC entry 222 (class 1259 OID 24635)
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 221 (class 1259 OID 24634)
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4929 (class 0 OID 0)
-- Dependencies: 221
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- TOC entry 218 (class 1259 OID 24578)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    bio text DEFAULT ''::text
);


--
-- TOC entry 217 (class 1259 OID 24577)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4930 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4755 (class 2604 OID 24602)
-- Name: friends id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends ALTER COLUMN id SET DEFAULT nextval('public.friends_id_seq'::regclass);


--
-- TOC entry 4757 (class 2604 OID 24638)
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- TOC entry 4752 (class 2604 OID 24581)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4766 (class 2606 OID 24605)
-- Name: friends friends_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_pkey PRIMARY KEY (id);


--
-- TOC entry 4768 (class 2606 OID 24607)
-- Name: friends friends_user_id_friend_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_user_id_friend_id_key UNIQUE (user_id, friend_id);


--
-- TOC entry 4774 (class 2606 OID 24643)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- TOC entry 4760 (class 2606 OID 24597)
-- Name: users user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_id_unique UNIQUE (user_id);


--
-- TOC entry 4762 (class 2606 OID 24583)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4764 (class 2606 OID 24585)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4769 (class 1259 OID 24619)
-- Name: idx_friends_friend_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_friends_friend_id ON public.friends USING btree (friend_id);


--
-- TOC entry 4770 (class 1259 OID 24618)
-- Name: idx_friends_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_friends_user_id ON public.friends USING btree (user_id);


--
-- TOC entry 4771 (class 1259 OID 24650)
-- Name: idx_posts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_created_at ON public.posts USING btree (created_at DESC);


--
-- TOC entry 4772 (class 1259 OID 24649)
-- Name: idx_posts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_user_id ON public.posts USING btree (user_id);


--
-- TOC entry 4775 (class 2606 OID 24613)
-- Name: friends friends_friend_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4776 (class 2606 OID 24608)
-- Name: friends friends_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4777 (class 2606 OID 24644)
-- Name: posts posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-01-21 17:58:51

--
-- PostgreSQL database dump complete
--

