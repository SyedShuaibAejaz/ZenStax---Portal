SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict maHaq17vJpv8h9SoywVHiSBsFdULmi3xMWqUS6pd4FLVZlccc0Hgj7C07JUxQU8

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."custom_oauth_providers" ("id", "provider_type", "identifier", "name", "client_id", "client_secret", "acceptable_client_ids", "scopes", "pkce_enabled", "attribute_mapping", "authorization_params", "enabled", "email_optional", "issuer", "discovery_url", "skip_nonce_check", "cached_discovery", "discovery_cached_at", "authorization_url", "token_url", "userinfo_url", "jwks_uri", "created_at", "updated_at", "custom_claims_allowlist") FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") FROM stdin;
00000000-0000-0000-0000-000000000000	4084363a-8d88-4223-a4b3-bf40bfd0ff74	authenticated	authenticated	shuaibsyed405@gmail.com	$2a$10$mBVW6uflXeLIj1s8luuOhejqcnyE4LIA1LOtII8UnBhJrF8nTr0Pq	\N	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"invited_role": "member", "invited_workspace_id": "cb7f6166-5360-4477-8bc2-484d43768f49"}	\N	2026-09-22 12:29:41.932504+00	2026-09-22 12:29:41.947999+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	1c83e908-4986-4a29-b953-e8df4bff9812	authenticated	authenticated	shuaibsyed404@gmail.com		\N	2026-09-22 11:48:21.425799+00	53789262dba32904119f52c67157758bf56d66ecf810d5e46d35fc21	2026-09-22 11:48:21.425799+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2026-09-22 11:45:42.880766+00	2026-09-22 11:48:23.120388+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	dad34d66-27cf-4003-8868-afefc1a6561a	authenticated	authenticated	sandhclaude@gmail.com	$2a$10$bRccDOl295aQm6zGIs3kyuVaPQDllRlsfWTPsIO5dZ3rx2Ipu8xdK	2026-09-22 12:58:14.036054+00	\N		\N		\N			\N	2026-09-22 13:14:30.161809+00	{"provider": "email", "providers": ["email"]}	{"invited_by": "b9887073-d6c8-4e97-9f09-e2f273dc1a37", "invited_role": "member", "email_verified": true, "invited_workspace_id": "cb7f6166-5360-4477-8bc2-484d43768f49"}	\N	2026-09-22 12:43:47.035666+00	2026-09-22 13:14:30.216676+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b9887073-d6c8-4e97-9f09-e2f273dc1a37	authenticated	authenticated	syedshuaib@zenstaxit.net	$2a$10$z..gdzqpE0syyZq/8SOSpOcCd7RnJcmXoX3fulN424krvtUxEfYdC	2026-09-21 07:52:11.067651+00	\N		\N		\N			\N	2026-09-21 07:52:34.536242+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-09-21 07:52:11.052356+00	2026-09-29 09:17:58.66575+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") FROM stdin;
b9887073-d6c8-4e97-9f09-e2f273dc1a37	b9887073-d6c8-4e97-9f09-e2f273dc1a37	{"sub": "b9887073-d6c8-4e97-9f09-e2f273dc1a37", "email": "syedshuaib@zenstaxit.net", "email_verified": false, "phone_verified": false}	email	2026-09-21 07:52:11.063561+00	2026-09-21 07:52:11.063625+00	2026-09-21 07:52:11.063625+00	ef0d61aa-ecd2-47ad-8990-4c7a6a7d44e4
1c83e908-4986-4a29-b953-e8df4bff9812	1c83e908-4986-4a29-b953-e8df4bff9812	{"sub": "1c83e908-4986-4a29-b953-e8df4bff9812", "email": "shuaibsyed404@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-09-22 11:45:42.91881+00	2026-09-22 11:45:42.918889+00	2026-09-22 11:45:42.918889+00	bfe6021e-3921-4c1c-8f0b-1b0bc5562e46
4084363a-8d88-4223-a4b3-bf40bfd0ff74	4084363a-8d88-4223-a4b3-bf40bfd0ff74	{"sub": "4084363a-8d88-4223-a4b3-bf40bfd0ff74", "email": "shuaibsyed405@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-09-22 12:29:41.946217+00	2026-09-22 12:29:41.946272+00	2026-09-22 12:29:41.946272+00	9079ea03-7315-4c1e-94cd-c315a8b2f138
dad34d66-27cf-4003-8868-afefc1a6561a	dad34d66-27cf-4003-8868-afefc1a6561a	{"sub": "dad34d66-27cf-4003-8868-afefc1a6561a", "email": "sandhclaude@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-09-22 12:43:47.070769+00	2026-09-22 12:43:47.070822+00	2026-09-22 12:43:47.070822+00	d393aac1-1fce-4f65-a927-47a320cd5db8
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."instances" ("id", "uuid", "raw_base_config", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_clients" ("id", "client_secret_hash", "registration_type", "redirect_uris", "grant_types", "client_name", "client_uri", "logo_uri", "created_at", "updated_at", "deleted_at", "client_type", "token_endpoint_auth_method") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") FROM stdin;
5c484162-9456-4a5d-9e64-2f87bdc8f632	dad34d66-27cf-4003-8868-afefc1a6561a	2026-09-22 13:14:30.163714+00	2026-09-22 13:14:30.163714+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	5.107.76.34	\N	\N	\N	\N	\N
b18dfba4-6937-4c89-887c-2573cd12ff5f	b9887073-d6c8-4e97-9f09-e2f273dc1a37	2026-09-21 07:52:34.537018+00	2026-09-29 09:17:58.679291+00	\N	aal1	\N	2026-09-29 09:17:58.67919	node	94.207.193.207	\N	\N	\N	\N	\N
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") FROM stdin;
b18dfba4-6937-4c89-887c-2573cd12ff5f	2026-09-21 07:52:34.567372+00	2026-09-21 07:52:34.567372+00	password	e800749a-ce4d-482c-acd3-0d501b1cb7ec
5c484162-9456-4a5d-9e64-2f87bdc8f632	2026-09-22 13:14:30.224528+00	2026-09-22 13:14:30.224528+00	password	18db91ae-4336-4ec1-9ad7-a81e92362953
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_factors" ("id", "user_id", "friendly_name", "factor_type", "status", "created_at", "updated_at", "secret", "phone", "last_challenged_at", "web_authn_credential", "web_authn_aaguid", "last_webauthn_challenge_data") FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_challenges" ("id", "factor_id", "created_at", "verified_at", "ip_address", "otp_code", "web_authn_session_data") FROM stdin;
\.


--
-- Data for Name: mfa_recovery_code_sets; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_recovery_code_sets" ("id", "user_id", "mfa_factor_id", "failed_verification_count", "verification_locked_until", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: mfa_recovery_codes; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_recovery_codes" ("id", "mfa_recovery_code_set_id", "code_hash", "consumed_at", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_authorizations" ("id", "authorization_id", "client_id", "user_id", "redirect_uri", "scope", "state", "resource", "code_challenge", "code_challenge_method", "response_type", "status", "authorization_code", "created_at", "expires_at", "approved_at", "nonce") FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_client_states" ("id", "provider_type", "code_verifier", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_consents" ("id", "user_id", "client_id", "scopes", "granted_at", "revoked_at") FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at", "expires_at") FROM stdin;
c0ccf30c-f19b-4c9d-89e5-4675ecfadfe4	1c83e908-4986-4a29-b953-e8df4bff9812	confirmation_token	53789262dba32904119f52c67157758bf56d66ecf810d5e46d35fc21	shuaibsyed404@gmail.com	2026-09-22 11:48:23.134788	2026-09-22 11:48:23.134788	\N
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") FROM stdin;
00000000-0000-0000-0000-000000000000	1	4vatwebyzlr4	b9887073-d6c8-4e97-9f09-e2f273dc1a37	t	2026-09-21 07:52:34.555539+00	2026-09-21 09:04:04.10606+00	\N	b18dfba4-6937-4c89-887c-2573cd12ff5f
00000000-0000-0000-0000-000000000000	2	galbjvf4mezj	b9887073-d6c8-4e97-9f09-e2f273dc1a37	t	2026-09-21 09:04:04.117389+00	2026-09-22 08:14:41.01416+00	4vatwebyzlr4	b18dfba4-6937-4c89-887c-2573cd12ff5f
00000000-0000-0000-0000-000000000000	3	pht473shqciy	b9887073-d6c8-4e97-9f09-e2f273dc1a37	t	2026-09-22 08:14:41.028897+00	2026-09-22 09:14:25.606605+00	galbjvf4mezj	b18dfba4-6937-4c89-887c-2573cd12ff5f
00000000-0000-0000-0000-000000000000	4	dxg4dmoz6hrd	b9887073-d6c8-4e97-9f09-e2f273dc1a37	t	2026-09-22 09:14:25.625764+00	2026-09-22 10:12:31.038327+00	pht473shqciy	b18dfba4-6937-4c89-887c-2573cd12ff5f
00000000-0000-0000-0000-000000000000	5	krk4rrgmibm4	b9887073-d6c8-4e97-9f09-e2f273dc1a37	t	2026-09-22 10:12:31.050366+00	2026-09-22 11:10:57.115618+00	dxg4dmoz6hrd	b18dfba4-6937-4c89-887c-2573cd12ff5f
00000000-0000-0000-0000-000000000000	6	dnkgolfayyom	b9887073-d6c8-4e97-9f09-e2f273dc1a37	t	2026-09-22 11:10:57.125555+00	2026-09-22 12:09:48.199609+00	krk4rrgmibm4	b18dfba4-6937-4c89-887c-2573cd12ff5f
00000000-0000-0000-0000-000000000000	7	hftw77hxma5r	b9887073-d6c8-4e97-9f09-e2f273dc1a37	t	2026-09-22 12:09:48.215642+00	2026-09-22 13:09:45.139102+00	dnkgolfayyom	b18dfba4-6937-4c89-887c-2573cd12ff5f
00000000-0000-0000-0000-000000000000	12	swylywt7ohy7	dad34d66-27cf-4003-8868-afefc1a6561a	f	2026-09-22 13:14:30.202242+00	2026-09-22 13:14:30.202242+00	\N	5c484162-9456-4a5d-9e64-2f87bdc8f632
00000000-0000-0000-0000-000000000000	10	akoqgb2sjql2	b9887073-d6c8-4e97-9f09-e2f273dc1a37	t	2026-09-22 13:09:45.142295+00	2026-09-27 15:36:16.766049+00	hftw77hxma5r	b18dfba4-6937-4c89-887c-2573cd12ff5f
00000000-0000-0000-0000-000000000000	13	4ybvf3ydhg6l	b9887073-d6c8-4e97-9f09-e2f273dc1a37	t	2026-09-27 15:36:16.776781+00	2026-09-27 16:35:39.344984+00	akoqgb2sjql2	b18dfba4-6937-4c89-887c-2573cd12ff5f
00000000-0000-0000-0000-000000000000	14	ljqpd3ynelvw	b9887073-d6c8-4e97-9f09-e2f273dc1a37	t	2026-09-27 16:35:39.356845+00	2026-09-27 17:33:54.612361+00	4ybvf3ydhg6l	b18dfba4-6937-4c89-887c-2573cd12ff5f
00000000-0000-0000-0000-000000000000	15	u42iubysdliq	b9887073-d6c8-4e97-9f09-e2f273dc1a37	t	2026-09-27 17:33:54.624684+00	2026-09-27 18:33:15.482038+00	ljqpd3ynelvw	b18dfba4-6937-4c89-887c-2573cd12ff5f
00000000-0000-0000-0000-000000000000	16	td2w2u22syeu	b9887073-d6c8-4e97-9f09-e2f273dc1a37	t	2026-09-27 18:33:15.49571+00	2026-09-29 09:17:58.649366+00	u42iubysdliq	b18dfba4-6937-4c89-887c-2573cd12ff5f
00000000-0000-0000-0000-000000000000	17	c6vmbexr4xqv	b9887073-d6c8-4e97-9f09-e2f273dc1a37	f	2026-09-29 09:17:58.661492+00	2026-09-29 09:17:58.661492+00	td2w2u22syeu	b18dfba4-6937-4c89-887c-2573cd12ff5f
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_providers" ("id", "resource_id", "created_at", "updated_at", "disabled") FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_providers" ("id", "sso_provider_id", "entity_id", "metadata_xml", "metadata_url", "attribute_mapping", "created_at", "updated_at", "name_id_format") FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_relay_states" ("id", "sso_provider_id", "request_id", "for_email", "redirect_to", "created_at", "updated_at", "flow_state_id") FROM stdin;
\.


--
-- Data for Name: scim_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."scim_tokens" ("id", "sso_provider_id", "token_hash", "prefix", "created_at", "expires_at", "revoked_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: scim_users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."scim_users" ("id", "sso_provider_id", "user_id", "resource", "created_at", "updated_at", "deleted_at") FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_domains" ("id", "sso_provider_id", "domain", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_challenges" ("id", "user_id", "challenge_type", "session_data", "created_at", "expires_at") FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_credentials" ("id", "user_id", "credential_id", "public_key", "attestation_type", "aaguid", "sign_count", "transports", "backup_eligible", "backed_up", "friendly_name", "created_at", "updated_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."profiles" ("id", "full_name", "role", "created_at", "email", "updated_at") FROM stdin;
b9887073-d6c8-4e97-9f09-e2f273dc1a37	Syed Shuaib	partner	2026-09-21 07:52:11.05117+00	syedshuaib@zenstaxit.net	2026-09-22 11:18:57.042369+00
1c83e908-4986-4a29-b953-e8df4bff9812	ZenStax User	partner	2026-09-22 11:45:42.879742+00	\N	2026-09-22 11:45:42.879742+00
4084363a-8d88-4223-a4b3-bf40bfd0ff74	shuaibsyed405	partner	2026-09-22 12:29:41.932113+00	shuaibsyed405@gmail.com	2026-09-22 12:29:41.932113+00
dad34d66-27cf-4003-8868-afefc1a6561a	sandhclaude	partner	2026-09-22 12:43:47.034717+00	sandhclaude@gmail.com	2026-09-22 12:43:47.034717+00
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."activity_logs" ("id", "user_id", "action", "entity_type", "entity_id", "metadata", "created_at") FROM stdin;
\.


--
-- Data for Name: workspaces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."workspaces" ("id", "name", "created_by", "created_at", "legal_name", "phone", "email", "address", "updated_at", "logo_url", "primary_color", "secondary_color") FROM stdin;
cb7f6166-5360-4477-8bc2-484d43768f49	ZenStax workspace	b9887073-d6c8-4e97-9f09-e2f273dc1a37	2026-09-22 10:43:00.869856+00	\N	\N	\N	\N	2026-09-22 13:26:58.064976+00	\N	#FF7425	#071B31
63e2c2a6-68c8-475c-b44b-7f0293ebd433	Syed Shuaib Workspace	b9887073-d6c8-4e97-9f09-e2f273dc1a37	2026-09-27 17:07:16.504549+00	\N	\N	\N	\N	2026-09-27 17:07:16.504549+00	\N	#FF7425	#071B31
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."audit_logs" ("id", "workspace_id", "user_id", "action", "entity_type", "entity_id", "old_data", "new_data", "metadata", "created_at") FROM stdin;
97e94557-27c5-4e88-97a7-b0ed6254fb10	63e2c2a6-68c8-475c-b44b-7f0293ebd433	\N	insert	workspaces	63e2c2a6-68c8-475c-b44b-7f0293ebd433	\N	{"id": "63e2c2a6-68c8-475c-b44b-7f0293ebd433", "name": "Syed Shuaib Workspace", "email": null, "phone": null, "address": null, "logo_url": null, "created_at": "2026-09-27T17:07:16.504549+00:00", "created_by": "b9887073-d6c8-4e97-9f09-e2f273dc1a37", "legal_name": null, "updated_at": "2026-09-27T17:07:16.504549+00:00", "primary_color": "#FF7425", "secondary_color": "#071B31"}	{"table": "workspaces", "schema": "public"}	2026-09-27 17:07:16.504549+00
34142de9-d530-4f18-9d8d-65e18afb8827	63e2c2a6-68c8-475c-b44b-7f0293ebd433	\N	insert	workspace_members	b9887073-d6c8-4e97-9f09-e2f273dc1a37	\N	{"role": "owner", "user_id": "b9887073-d6c8-4e97-9f09-e2f273dc1a37", "created_at": "2026-09-27T17:07:49.517156+00:00", "workspace_id": "63e2c2a6-68c8-475c-b44b-7f0293ebd433"}	{"table": "workspace_members", "schema": "public"}	2026-09-27 17:07:49.517156+00
e06c253f-964e-4c09-8243-bb2dfae02511	cb7f6166-5360-4477-8bc2-484d43768f49	\N	insert	documents	f285b89c-8686-465e-9bf3-f21696afa668	\N	{"id": "f285b89c-8686-465e-9bf3-f21696afa668", "title": "Test Invoice", "category": "Invoice", "file_name": "zen-inv-0003.pdf", "file_path": "cb7f6166-5360-4477-8bc2-484d43768f49/f285b89c-8686-465e-9bf3-f21696afa668/f285b89c-8686-465e-9bf3-f21696afa668.pdf", "file_size": 4134, "mime_type": "application/pdf", "created_at": "2026-09-27T18:12:48.576178+00:00", "updated_at": "2026-09-27T18:12:48.576178+00:00", "description": "test", "uploaded_by": "b9887073-d6c8-4e97-9f09-e2f273dc1a37", "workspace_id": "cb7f6166-5360-4477-8bc2-484d43768f49"}	{"table": "documents", "schema": "public"}	2026-09-27 18:12:48.576178+00
2a2eac5c-9210-4e4f-9b5a-742fda12afa3	cb7f6166-5360-4477-8bc2-484d43768f49	\N	insert	documents	1263c5b5-291d-4575-b548-a464da2997fa	\N	{"id": "1263c5b5-291d-4575-b548-a464da2997fa", "title": "Test Quotation", "category": "Quotation", "file_name": "zenstax-quotation-2.pdf", "file_path": "cb7f6166-5360-4477-8bc2-484d43768f49/1263c5b5-291d-4575-b548-a464da2997fa/1263c5b5-291d-4575-b548-a464da2997fa.pdf", "file_size": 3521, "mime_type": "application/pdf", "created_at": "2026-09-27T18:13:38.71841+00:00", "updated_at": "2026-09-27T18:13:38.71841+00:00", "description": "test", "uploaded_by": "b9887073-d6c8-4e97-9f09-e2f273dc1a37", "workspace_id": "cb7f6166-5360-4477-8bc2-484d43768f49"}	{"table": "documents", "schema": "public"}	2026-09-27 18:13:38.71841+00
cab555af-5859-44ae-b0c0-629250d61ea3	cb7f6166-5360-4477-8bc2-484d43768f49	\N	insert	documents	564c8e91-8f79-4c22-8812-5d68ee6eba80	\N	{"id": "564c8e91-8f79-4c22-8812-5d68ee6eba80", "title": "Test Invoice", "category": "Invoice", "file_name": "zen-inv-0003.pdf", "file_path": "cb7f6166-5360-4477-8bc2-484d43768f49/564c8e91-8f79-4c22-8812-5d68ee6eba80/564c8e91-8f79-4c22-8812-5d68ee6eba80.pdf", "file_size": 4134, "mime_type": "application/pdf", "created_at": "2026-09-27T18:17:09.46688+00:00", "updated_at": "2026-09-27T18:17:09.46688+00:00", "description": "test", "uploaded_by": "b9887073-d6c8-4e97-9f09-e2f273dc1a37", "workspace_id": "cb7f6166-5360-4477-8bc2-484d43768f49"}	{"table": "documents", "schema": "public"}	2026-09-27 18:17:09.46688+00
ec6fe19e-68a7-4bf4-ba51-3bc54244b167	cb7f6166-5360-4477-8bc2-484d43768f49	\N	update	documents	1263c5b5-291d-4575-b548-a464da2997fa	{"id": "1263c5b5-291d-4575-b548-a464da2997fa", "title": "Test Quotation", "category": "Quotation", "file_name": "zenstax-quotation-2.pdf", "file_path": "cb7f6166-5360-4477-8bc2-484d43768f49/1263c5b5-291d-4575-b548-a464da2997fa/1263c5b5-291d-4575-b548-a464da2997fa.pdf", "file_size": 3521, "mime_type": "application/pdf", "created_at": "2026-09-27T18:13:38.71841+00:00", "updated_at": "2026-09-27T18:13:38.71841+00:00", "description": "test", "uploaded_by": "b9887073-d6c8-4e97-9f09-e2f273dc1a37", "workspace_id": "cb7f6166-5360-4477-8bc2-484d43768f49"}	{"id": "1263c5b5-291d-4575-b548-a464da2997fa", "title": "Test Quotation", "category": "Quotation", "file_name": "zenstax-quotation-2.pdf", "file_path": "cb7f6166-5360-4477-8bc2-484d43768f49/f285b89c-8686-465e-9bf3-f21696afa668/f285b89c-8686-465e-9bf3-f21696afa668.pdf", "file_size": 4134, "mime_type": "application/pdf", "created_at": "2026-09-27T18:13:38.71841+00:00", "updated_at": "2026-09-27T18:13:38.71841+00:00", "description": "test", "uploaded_by": "b9887073-d6c8-4e97-9f09-e2f273dc1a37", "workspace_id": "cb7f6166-5360-4477-8bc2-484d43768f49"}	{"table": "documents", "schema": "public"}	2026-09-27 18:23:51.998294+00
0c517798-bf54-4a7a-933f-33532f9bdf7c	cb7f6166-5360-4477-8bc2-484d43768f49	\N	update	documents	f285b89c-8686-465e-9bf3-f21696afa668	{"id": "f285b89c-8686-465e-9bf3-f21696afa668", "title": "Test Invoice", "category": "Invoice", "file_name": "zen-inv-0003.pdf", "file_path": "cb7f6166-5360-4477-8bc2-484d43768f49/f285b89c-8686-465e-9bf3-f21696afa668/f285b89c-8686-465e-9bf3-f21696afa668.pdf", "file_size": 4134, "mime_type": "application/pdf", "created_at": "2026-09-27T18:12:48.576178+00:00", "updated_at": "2026-09-27T18:12:48.576178+00:00", "description": "test", "uploaded_by": "b9887073-d6c8-4e97-9f09-e2f273dc1a37", "workspace_id": "cb7f6166-5360-4477-8bc2-484d43768f49"}	{"id": "f285b89c-8686-465e-9bf3-f21696afa668", "title": "Test Invoice", "category": "Invoice", "file_name": "zen-inv-0003.pdf", "file_path": "cb7f6166-5360-4477-8bc2-484d43768f49/1263c5b5-291d-4575-b548-a464da2997fa/1263c5b5-291d-4575-b548-a464da2997fa.pdf", "file_size": 3521, "mime_type": "application/pdf", "created_at": "2026-09-27T18:12:48.576178+00:00", "updated_at": "2026-09-27T18:12:48.576178+00:00", "description": "test", "uploaded_by": "b9887073-d6c8-4e97-9f09-e2f273dc1a37", "workspace_id": "cb7f6166-5360-4477-8bc2-484d43768f49"}	{"table": "documents", "schema": "public"}	2026-09-27 18:24:55.290139+00
c5bb7108-b7f5-420f-9d48-ca36ce74dbb9	cb7f6166-5360-4477-8bc2-484d43768f49	\N	insert	documents	84b197b3-6671-4c9a-b5b0-62f10e3b460e	\N	{"id": "84b197b3-6671-4c9a-b5b0-62f10e3b460e", "title": "Blue Crescent Quotation", "category": "Quotation", "file_name": "zenstax-quotation.pdf", "file_path": "cb7f6166-5360-4477-8bc2-484d43768f49/84b197b3-6671-4c9a-b5b0-62f10e3b460e/84b197b3-6671-4c9a-b5b0-62f10e3b460e.pdf", "file_size": 19275, "mime_type": "application/pdf", "created_at": "2026-09-27T18:46:55.100131+00:00", "updated_at": "2026-09-27T18:46:55.100131+00:00", "description": "CRM with Hosting and Cloud Backed", "uploaded_by": "b9887073-d6c8-4e97-9f09-e2f273dc1a37", "workspace_id": "cb7f6166-5360-4477-8bc2-484d43768f49"}	{"table": "documents", "schema": "public"}	2026-09-27 18:46:55.100131+00
05974642-18ef-40df-aef4-bbedbb8052b2	cb7f6166-5360-4477-8bc2-484d43768f49	\N	delete	documents	84b197b3-6671-4c9a-b5b0-62f10e3b460e	{"id": "84b197b3-6671-4c9a-b5b0-62f10e3b460e", "title": "Blue Crescent Quotation", "category": "Quotation", "file_name": "zenstax-quotation.pdf", "file_path": "cb7f6166-5360-4477-8bc2-484d43768f49/84b197b3-6671-4c9a-b5b0-62f10e3b460e/84b197b3-6671-4c9a-b5b0-62f10e3b460e.pdf", "file_size": 19275, "mime_type": "application/pdf", "created_at": "2026-09-27T18:46:55.100131+00:00", "updated_at": "2026-09-27T18:46:55.100131+00:00", "description": "CRM with Hosting and Cloud Backed", "uploaded_by": "b9887073-d6c8-4e97-9f09-e2f273dc1a37", "workspace_id": "cb7f6166-5360-4477-8bc2-484d43768f49"}	\N	{"table": "documents", "schema": "public"}	2026-09-27 18:49:35.402907+00
\.


--
-- Data for Name: business_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."business_settings" ("id", "business_name", "legal_name", "logo_path", "address", "email", "phone", "website", "trn", "default_currency", "default_vat_rate", "invoice_prefix", "quotation_prefix", "bank_details", "terms_and_conditions", "updated_at") FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."clients" ("id", "name", "company_name", "email", "phone", "address", "trn", "notes", "created_by", "created_at", "updated_at", "workspace_id") FROM stdin;
1966bb31-815b-4c0e-be43-5a68e975b1fa	Muhammad Faraz Qureshi	Blue Crescent Real Estate	Info@bluecrescentrealtyllc.com	0554619231	Mezzanine Floor, Amber Gem Tower, Neuventure Freezone, Ajman, UAE	\N	CRM Client	b9887073-d6c8-4e97-9f09-e2f273dc1a37	2026-09-21 09:06:58.486029+00	2026-09-21 09:06:58.486029+00	cb7f6166-5360-4477-8bc2-484d43768f49
75c08f05-b929-4fc2-819e-75c04861e37a	Syed Shuaib	\N	shuaibsyed404@gmail.com	+971521302565	Al Ittihad St, Al Nahda	\N	\N	b9887073-d6c8-4e97-9f09-e2f273dc1a37	2026-09-27 16:25:03.384174+00	2026-09-27 16:25:02.467+00	cb7f6166-5360-4477-8bc2-484d43768f49
152fbafc-622c-4909-8505-0ccdc70e44bd	Mhmd Humaid	ZenStax	mhmdhumaid@zenstaxit.com	0582593597	\N	\N	\N	b9887073-d6c8-4e97-9f09-e2f273dc1a37	2026-09-29 09:20:33.279305+00	2026-09-29 09:20:32.426+00	cb7f6166-5360-4477-8bc2-484d43768f49
\.


--
-- Data for Name: company_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."company_settings" ("id", "workspace_id", "legal_name", "trading_name", "logo_path", "email", "phone", "website", "address_line_1", "address_line_2", "city", "emirate", "country", "postal_code", "trn", "default_currency", "default_vat_rate", "bank_name", "bank_account_name", "bank_account_number", "iban", "swift_code", "payment_terms", "quotation_validity_days", "invoice_footer", "quotation_footer", "created_by", "created_at", "updated_at", "authorized_signatory_name", "authorized_signatory_title", "authorized_signatory_email", "brand_primary_color", "brand_secondary_color") FROM stdin;
aa1e948a-a652-4eb3-8c6b-aaf8d838a07e	cb7f6166-5360-4477-8bc2-484d43768f49	ZenStax FZC LLC	ZenStax	company/logo-1790075469932.png	contactus@zenstaxit.com	\N	\N	\N	\N	\N	\N	United Arab Emirates	\N	\N	AED	5.00	\N	\N	\N	\N	\N	Payment due within 30 days.	7	\N	\N	\N	2026-09-22 10:38:59.834171+00	2026-09-22 13:15:24.24892+00	Mhmd Humaid	Manager / Authorized Signatory	mhmdhumaid@zenstaxit.com	#FF7425	#071B31
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."quotations" ("id", "quotation_number", "client_id", "issue_date", "valid_until", "status", "currency", "subtotal", "discount", "vat_amount", "total", "notes", "pdf_path", "created_by", "created_at", "updated_at", "workspace_id") FROM stdin;
ddf84143-9eff-4f53-8bde-e62ed88e8f7c	ZEN-QUO-0001	1966bb31-815b-4c0e-be43-5a68e975b1fa	2026-09-22	2026-09-29	converted	AED	3000.00	0.00	0.00	3000.00	CRM Implementation & Hosting Terms Project Execution\n\nDeposit: 840 (30% of 2,800) required to kick off development.\n\nDeployment Balance: 1,960 (70% of 2,800) due upon final live project deployment.\n\nRecurring Hosting: 200 / month starting from initial CRM setup, recurring monthly.	\N	b9887073-d6c8-4e97-9f09-e2f273dc1a37	2026-09-22 10:10:25.116436+00	2026-09-22 10:10:25.116436+00	cb7f6166-5360-4477-8bc2-484d43768f49
a806e78c-9ece-45f2-9f49-56f51ae8760b	ZEN-QUO-0003	75c08f05-b929-4fc2-819e-75c04861e37a	2026-09-27	2026-09-30	converted	AED	150.00	0.00	7.50	157.50	\N	quotations/a806e78c-9ece-45f2-9f49-56f51ae8760b/ZEN-QUO-0003.pdf	b9887073-d6c8-4e97-9f09-e2f273dc1a37	2026-09-27 16:35:59.95879+00	2026-09-27 17:19:26.145+00	cb7f6166-5360-4477-8bc2-484d43768f49
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."invoices" ("id", "invoice_number", "quotation_id", "client_id", "issue_date", "due_date", "status", "currency", "subtotal", "discount", "vat_amount", "total", "amount_paid", "notes", "pdf_path", "created_by", "created_at", "updated_at", "workspace_id", "payment_provider", "payment_checkout_id", "payment_url", "payment_expires_at") FROM stdin;
7774d073-6373-405a-8fe6-7913265c256c	ZEN-INV-0003	a806e78c-9ece-45f2-9f49-56f51ae8760b	75c08f05-b929-4fc2-819e-75c04861e37a	2026-09-27	2026-10-27	partially_paid	AED	150.00	0.00	7.50	157.50	100.00	\N	\N	b9887073-d6c8-4e97-9f09-e2f273dc1a37	2026-09-27 17:19:26.072091+00	2026-09-27 17:19:26.072091+00	cb7f6166-5360-4477-8bc2-484d43768f49	\N	\N	\N	\N
\.


--
-- Data for Name: credit_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."credit_notes" ("id", "credit_note_number", "invoice_id", "client_id", "issue_date", "reason", "subtotal", "vat_amount", "total", "status", "created_by", "created_at") FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."documents" ("id", "workspace_id", "uploaded_by", "title", "description", "category", "file_name", "file_path", "mime_type", "file_size", "created_at", "updated_at") FROM stdin;
564c8e91-8f79-4c22-8812-5d68ee6eba80	cb7f6166-5360-4477-8bc2-484d43768f49	b9887073-d6c8-4e97-9f09-e2f273dc1a37	Test Invoice	test	Invoice	zen-inv-0003.pdf	cb7f6166-5360-4477-8bc2-484d43768f49/564c8e91-8f79-4c22-8812-5d68ee6eba80/564c8e91-8f79-4c22-8812-5d68ee6eba80.pdf	application/pdf	4134	2026-09-27 18:17:09.46688+00	2026-09-27 18:17:09.46688+00
1263c5b5-291d-4575-b548-a464da2997fa	cb7f6166-5360-4477-8bc2-484d43768f49	b9887073-d6c8-4e97-9f09-e2f273dc1a37	Test Quotation	test	Quotation	zenstax-quotation-2.pdf	cb7f6166-5360-4477-8bc2-484d43768f49/f285b89c-8686-465e-9bf3-f21696afa668/f285b89c-8686-465e-9bf3-f21696afa668.pdf	application/pdf	4134	2026-09-27 18:13:38.71841+00	2026-09-27 18:13:38.71841+00
f285b89c-8686-465e-9bf3-f21696afa668	cb7f6166-5360-4477-8bc2-484d43768f49	b9887073-d6c8-4e97-9f09-e2f273dc1a37	Test Invoice	test	Invoice	zen-inv-0003.pdf	cb7f6166-5360-4477-8bc2-484d43768f49/1263c5b5-291d-4575-b548-a464da2997fa/1263c5b5-291d-4575-b548-a464da2997fa.pdf	application/pdf	3521	2026-09-27 18:12:48.576178+00	2026-09-27 18:12:48.576178+00
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."expenses" ("id", "workspace_id", "description", "amount", "category", "expense_date", "created_by", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."invoice_items" ("id", "invoice_id", "description", "quantity", "unit_price", "vat_rate", "line_total") FROM stdin;
e239ea04-06d5-4ad2-a75b-eabe3875a316	7774d073-6373-405a-8fe6-7913265c256c	Website Development	1.00	150.00	5.00	150.00
\.


--
-- Data for Name: invoice_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."invoice_payments" ("id", "workspace_id", "invoice_id", "amount", "payment_date", "payment_method", "reference", "notes", "created_by", "created_at", "updated_at", "provider", "provider_payment_id", "provider_event_id", "provider_fee", "raw_data") FROM stdin;
\.


--
-- Data for Name: member_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."member_permissions" ("workspace_id", "user_id", "permission_key", "created_at") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."payments" ("id", "invoice_id", "payment_date", "amount", "method", "reference", "notes", "created_by", "created_at") FROM stdin;
\.


--
-- Data for Name: quotation_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."quotation_items" ("id", "quotation_id", "description", "quantity", "unit_price", "vat_rate", "line_total") FROM stdin;
4ffc9448-8a9f-46b3-81a9-b8a6d130f126	ddf84143-9eff-4f53-8bde-e62ed88e8f7c	Blue Crescent CRM	1.00	2800.00	0.00	2800.00
fae5d861-26cd-48d1-8b30-e6982333166c	ddf84143-9eff-4f53-8bde-e62ed88e8f7c	Hosting and Development	1.00	200.00	0.00	200.00
285f267d-d9c8-49fa-ad99-1abbc5cc6872	a806e78c-9ece-45f2-9f49-56f51ae8760b	Website Development	1.00	150.00	5.00	150.00
\.


--
-- Data for Name: workspace_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."workspace_members" ("workspace_id", "user_id", "role", "created_at") FROM stdin;
cb7f6166-5360-4477-8bc2-484d43768f49	b9887073-d6c8-4e97-9f09-e2f273dc1a37	owner	2026-09-22 11:21:56.648119+00
63e2c2a6-68c8-475c-b44b-7f0293ebd433	b9887073-d6c8-4e97-9f09-e2f273dc1a37	owner	2026-09-27 17:07:49.517156+00
\.


--
-- Data for Name: workspace_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."workspace_permissions" ("id", "workspace_id", "permission_key", "created_at") FROM stdin;
4c4f6ea1-c9dc-4b1a-8cc1-179ab8f30e41	cb7f6166-5360-4477-8bc2-484d43768f49	company.view	2026-09-22 11:30:12.018572+00
dcaca42c-350e-4547-87b4-a67615d848ac	cb7f6166-5360-4477-8bc2-484d43768f49	company.manage	2026-09-22 11:30:12.018572+00
6849c4cd-3fed-416d-9566-f642ff1ff516	cb7f6166-5360-4477-8bc2-484d43768f49	members.view	2026-09-22 11:30:12.018572+00
339e2e5b-ebf5-455e-8357-7b418f7dd1bd	cb7f6166-5360-4477-8bc2-484d43768f49	members.manage	2026-09-22 11:30:12.018572+00
fca2c3a7-f6df-4849-8d77-cff039b84347	cb7f6166-5360-4477-8bc2-484d43768f49	quotations.view	2026-09-22 11:30:12.018572+00
346a4f47-2a58-47a2-b505-eeb6de61b73e	cb7f6166-5360-4477-8bc2-484d43768f49	quotations.create	2026-09-22 11:30:12.018572+00
ec4edb80-15e8-40b5-ab84-e0cbde0603be	cb7f6166-5360-4477-8bc2-484d43768f49	quotations.edit	2026-09-22 11:30:12.018572+00
becd1bf0-d07b-499d-a520-6203fbe478d7	cb7f6166-5360-4477-8bc2-484d43768f49	quotations.delete	2026-09-22 11:30:12.018572+00
8d733495-7178-448c-90a4-0441fdf6ba7f	cb7f6166-5360-4477-8bc2-484d43768f49	quotations.convert	2026-09-22 11:30:12.018572+00
939026f3-c19e-43d0-8442-9809fad65afa	cb7f6166-5360-4477-8bc2-484d43768f49	invoices.view	2026-09-22 11:30:12.018572+00
8cb46c9b-9936-462f-88b5-02a80c6b4cbf	cb7f6166-5360-4477-8bc2-484d43768f49	invoices.create	2026-09-22 11:30:12.018572+00
b732c9ce-549b-4768-ba49-d26cc9a56839	cb7f6166-5360-4477-8bc2-484d43768f49	invoices.edit	2026-09-22 11:30:12.018572+00
9d9a2d18-673e-427e-b31a-bf4e4b470761	cb7f6166-5360-4477-8bc2-484d43768f49	invoices.delete	2026-09-22 11:30:12.018572+00
ee897d16-d1aa-4210-ad2d-735a3a6eb2de	cb7f6166-5360-4477-8bc2-484d43768f49	invoices.cancel	2026-09-22 11:30:12.018572+00
13dff861-a8a0-4d77-b147-94e08ea0006f	cb7f6166-5360-4477-8bc2-484d43768f49	payments.view	2026-09-22 11:30:12.018572+00
f4cb86c4-6e58-4f6e-bac6-090c296f1756	cb7f6166-5360-4477-8bc2-484d43768f49	payments.create	2026-09-22 11:30:12.018572+00
bcd130c7-a899-43be-bf3d-779efc9daa98	cb7f6166-5360-4477-8bc2-484d43768f49	payments.edit	2026-09-22 11:30:12.018572+00
4f90aa01-6967-4fd5-abca-3211002faf96	cb7f6166-5360-4477-8bc2-484d43768f49	payments.delete	2026-09-22 11:30:12.018572+00
363a2674-8d0c-41fe-814a-cb7cb2544eb2	cb7f6166-5360-4477-8bc2-484d43768f49	documents.view	2026-09-22 11:30:12.018572+00
ca9ad425-2236-4136-a79b-fc2eda1ed6fd	cb7f6166-5360-4477-8bc2-484d43768f49	documents.upload	2026-09-22 11:30:12.018572+00
9022e794-3dc5-48db-b01b-7f1c46dc8b7a	cb7f6166-5360-4477-8bc2-484d43768f49	documents.delete	2026-09-22 11:30:12.018572+00
77b0b962-2722-45e7-aab2-3285c630f66a	cb7f6166-5360-4477-8bc2-484d43768f49	reports.view	2026-09-22 11:30:12.018572+00
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type", "versioning_status", "lifecycle_configuration", "lifecycle_configuration_generation") FROM stdin;
zenstax-private	zenstax-private	\N	2026-09-21 07:37:39.032526+00	2026-09-21 07:37:39.032526+00	f	f	26214400	{application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*}	\N	STANDARD	DISABLED	\N	\N
workspace-branding	workspace-branding	\N	2026-09-22 13:34:26.822982+00	2026-09-22 13:34:26.822982+00	t	f	\N	\N	\N	STANDARD	DISABLED	\N	\N
workspace-documents	workspace-documents	\N	2026-09-27 17:27:27.067578+00	2026-09-27 17:27:27.067578+00	f	f	52428800	{application/pdf,image/jpeg,image/png,image/webp,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet}	\N	STANDARD	DISABLED	\N	\N
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_analytics" ("name", "type", "format", "created_at", "updated_at", "id", "deleted_at") FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_vectors" ("id", "type", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "archived_at", "is_delete_marker", "is_versioned") FROM stdin;
83830ea3-bec9-48b1-9da5-dbc2f87d8626	zenstax-private	quotations/caae98d6-3979-435b-ad02-bf0cfb61cbd1/ZEN-QUO-1789982496622.pdf	b9887073-d6c8-4e97-9f09-e2f273dc1a37	2026-09-22 08:41:12.152391+00	2026-09-22 08:41:12.152391+00	2026-09-22 08:41:12.152391+00	{"eTag": "\\"552eac7a26338feaee879800a5b6108b\\"", "size": 4118, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-09-22T08:41:13.000Z", "contentLength": 4118, "httpStatusCode": 200}	911acc1d-06e7-4fb5-b949-2519ddd33400	b9887073-d6c8-4e97-9f09-e2f273dc1a37	{}	\N	f	f
6452f244-c62b-4b33-8f6b-9d031b52f181	zenstax-private	company/logo-1790075469932.png	b9887073-d6c8-4e97-9f09-e2f273dc1a37	2026-09-22 11:11:10.710397+00	2026-09-22 11:11:10.710397+00	2026-09-22 11:11:10.710397+00	{"eTag": "\\"9945350cf45595c603b4b20d4d447b1e\\"", "size": 48795, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-22T11:11:11.000Z", "contentLength": 48795, "httpStatusCode": 200}	be7660f9-1bcc-4c26-a3e7-e56183141b17	b9887073-d6c8-4e97-9f09-e2f273dc1a37	{}	\N	f	f
991d6787-402e-4615-b2d8-b1fbe410317f	zenstax-private	quotations/a806e78c-9ece-45f2-9f49-56f51ae8760b/ZEN-QUO-0003.pdf	b9887073-d6c8-4e97-9f09-e2f273dc1a37	2026-09-27 16:37:10.352149+00	2026-09-27 16:37:10.352149+00	2026-09-27 16:37:10.352149+00	{"eTag": "\\"537554107d3fbab80a7a2d5f22eba979\\"", "size": 3521, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-09-27T16:37:11.000Z", "contentLength": 3521, "httpStatusCode": 200}	7ae5e002-c287-4881-95ec-43e6360d6339	b9887073-d6c8-4e97-9f09-e2f273dc1a37	{}	\N	f	f
e696067f-1f29-4fe9-a329-368214b23336	workspace-documents	cb7f6166-5360-4477-8bc2-484d43768f49/f285b89c-8686-465e-9bf3-f21696afa668/f285b89c-8686-465e-9bf3-f21696afa668.pdf	\N	2026-09-27 18:12:47.552377+00	2026-09-27 18:12:47.552377+00	2026-09-27 18:12:47.552377+00	{"eTag": "\\"5e9a372178e61488e6f58e78634316f7\\"", "size": 4134, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-09-27T18:12:48.000Z", "contentLength": 4134, "httpStatusCode": 200}	fc6d5b16-2afe-43db-9b40-5c2323ba1bd8	\N	{}	\N	f	f
ef6c6426-915d-42fb-b0c4-53c4a84d8849	workspace-documents	cb7f6166-5360-4477-8bc2-484d43768f49/1263c5b5-291d-4575-b548-a464da2997fa/1263c5b5-291d-4575-b548-a464da2997fa.pdf	\N	2026-09-27 18:13:38.125776+00	2026-09-27 18:13:38.125776+00	2026-09-27 18:13:38.125776+00	{"eTag": "\\"6a17eb9ca953f769c2fc66ac330585b2\\"", "size": 3521, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-09-27T18:13:39.000Z", "contentLength": 3521, "httpStatusCode": 200}	dd8da34c-1197-448e-a3df-df6dd491f5be	\N	{}	\N	f	f
475d8e72-41b6-4c35-9a51-fd7c554b9354	workspace-documents	cb7f6166-5360-4477-8bc2-484d43768f49/564c8e91-8f79-4c22-8812-5d68ee6eba80/564c8e91-8f79-4c22-8812-5d68ee6eba80.pdf	\N	2026-09-27 18:17:08.561239+00	2026-09-27 18:17:08.561239+00	2026-09-27 18:17:08.561239+00	{"eTag": "\\"5e9a372178e61488e6f58e78634316f7\\"", "size": 4134, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-09-27T18:17:09.000Z", "contentLength": 4134, "httpStatusCode": 200}	957cfdfe-7e24-4116-b3cb-deed45305a46	\N	{}	\N	f	f
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads" ("id", "in_progress_size", "upload_signature", "bucket_id", "key", "version", "owner_id", "created_at", "user_metadata", "metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads_parts" ("id", "upload_id", "size", "part_number", "bucket_id", "key", "etag", "owner_id", "version", "created_at") FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."vector_indexes" ("id", "name", "bucket_id", "data_type", "dimension", "distance_metric", "metadata_configuration", "created_at", "updated_at") FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 17, true);


--
-- Name: invoice_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."invoice_number_seq"', 3, true);


--
-- Name: quotation_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."quotation_number_seq"', 3, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict maHaq17vJpv8h9SoywVHiSBsFdULmi3xMWqUS6pd4FLVZlccc0Hgj7C07JUxQU8

RESET ALL;
