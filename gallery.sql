--
-- PostgreSQL database dump
--

\restrict LXj2qbjrCgsVOav1VlBaIfHor6ZPlxWUCPdswFo1fPAHhQPA82Kq2HnIjxKtOxz

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-03-15 18:33:07

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5011 (class 1262 OID 16388)
-- Name: gallery; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE gallery WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_Canada.1252';


ALTER DATABASE gallery OWNER TO postgres;

\unrestrict LXj2qbjrCgsVOav1VlBaIfHor6ZPlxWUCPdswFo1fPAHhQPA82Kq2HnIjxKtOxz
\connect gallery
\restrict LXj2qbjrCgsVOav1VlBaIfHor6ZPlxWUCPdswFo1fPAHhQPA82Kq2HnIjxKtOxz

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5012 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: drawings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drawings (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    author character varying(20) NOT NULL,
    image_path character varying(512) NOT NULL
);


ALTER TABLE public.drawings OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: drawings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drawings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drawings_id_seq OWNER TO postgres;

--
-- TOC entry 5013 (class 0 OID 0)
-- Dependencies: 219
-- Name: drawings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drawings_id_seq OWNED BY public.drawings.id;


--
-- TOC entry 4856 (class 2604 OID 16393)
-- Name: drawings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drawings ALTER COLUMN id SET DEFAULT nextval('public.drawings_id_seq'::regclass);


--
-- TOC entry 4858 (class 2606 OID 16402)
-- Name: drawings drawings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drawings
    ADD CONSTRAINT drawings_pkey PRIMARY KEY (id);


-- Completed on 2026-03-15 18:33:08

--
-- PostgreSQL database dump complete
--

\unrestrict LXj2qbjrCgsVOav1VlBaIfHor6ZPlxWUCPdswFo1fPAHhQPA82Kq2HnIjxKtOxz

