import { o as __toESM, r as __exportAll } from "../../_runtime.mjs";
import { d as require_config, o as require_protocols, r as require_client } from "./checksums+[...].mjs";
import { createHash, createPrivateKey, createPublicKey, sign } from "node:crypto";
import { promises } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
//#region node_modules/@aws-sdk/credential-provider-login/dist-es/LoginCredentialsFetcher.js
var import_client = require_client();
var import_config = require_config();
var import_protocols = require_protocols();
var LoginCredentialsFetcher = class LoginCredentialsFetcher {
	profileData;
	init;
	callerClientConfig;
	static REFRESH_THRESHOLD = 3e5;
	constructor(profileData, init, callerClientConfig) {
		this.profileData = profileData;
		this.init = init;
		this.callerClientConfig = callerClientConfig;
	}
	async loadCredentials() {
		const token = await this.loadToken();
		if (!token) throw new import_config.CredentialsProviderError(`Failed to load a token for session ${this.loginSession}, please re-authenticate using aws login`, {
			tryNextLink: false,
			logger: this.logger
		});
		const accessToken = token.accessToken;
		const now = Date.now();
		if (new Date(accessToken.expiresAt).getTime() - now <= LoginCredentialsFetcher.REFRESH_THRESHOLD) return this.refresh(token);
		return this.toCredentials(token.accessToken);
	}
	get logger() {
		return this.init?.logger;
	}
	get loginSession() {
		return this.profileData.login_session;
	}
	toCredentials(token) {
		return {
			accessKeyId: token.accessKeyId,
			secretAccessKey: token.secretAccessKey,
			sessionToken: token.sessionToken,
			accountId: token.accountId,
			expiration: new Date(token.expiresAt)
		};
	}
	async refresh(token) {
		const diskToken = await this.loadToken().catch(() => token);
		const now = Date.now();
		const diskExpiry = new Date(diskToken.accessToken.expiresAt).getTime();
		const tokenExpiry = new Date(token.accessToken.expiresAt).getTime();
		const freshToken = diskExpiry <= now && tokenExpiry > now ? token : diskToken;
		if (new Date(freshToken.accessToken.expiresAt).getTime() - Date.now() > LoginCredentialsFetcher.REFRESH_THRESHOLD) return this.toCredentials(freshToken.accessToken);
		const { SigninClient, CreateOAuth2TokenCommand } = await import("../aws-sdk__nested-clients.mjs").then((n) => /* @__PURE__ */ __toESM(n.r()));
		const { logger, userAgentAppId } = this.callerClientConfig ?? {};
		const isH2 = (requestHandler) => {
			return requestHandler?.metadata?.handlerProtocol === "h2";
		};
		const requestHandler = isH2(this.callerClientConfig?.requestHandler) ? void 0 : this.callerClientConfig?.requestHandler;
		const client = new SigninClient({
			credentials: {
				accessKeyId: "",
				secretAccessKey: ""
			},
			region: this.profileData.region ?? await this.callerClientConfig?.region?.() ?? process.env.AWS_REGION,
			requestHandler,
			logger,
			userAgentAppId,
			...this.init?.clientConfig
		});
		this.createDPoPInterceptor(client.middlewareStack);
		const commandInput = { tokenInput: {
			clientId: freshToken.clientId,
			refreshToken: freshToken.refreshToken,
			grantType: "refresh_token"
		} };
		try {
			const response = await client.send(new CreateOAuth2TokenCommand(commandInput));
			const { accessKeyId, secretAccessKey, sessionToken } = response.tokenOutput?.accessToken ?? {};
			const { refreshToken, expiresIn } = response.tokenOutput ?? {};
			if (!accessKeyId || !secretAccessKey || !sessionToken || !refreshToken) throw new import_config.CredentialsProviderError("Token refresh response missing required fields", {
				logger: this.logger,
				tryNextLink: false
			});
			const expiresInMs = (expiresIn ?? 900) * 1e3;
			const expiration = new Date(Date.now() + expiresInMs);
			const updatedToken = {
				...freshToken,
				accessToken: {
					...freshToken.accessToken,
					accessKeyId,
					secretAccessKey,
					sessionToken,
					expiresAt: expiration.toISOString()
				},
				refreshToken
			};
			await this.saveToken(updatedToken);
			return this.toCredentials(updatedToken.accessToken);
		} catch (error) {
			if (error.name === "AccessDeniedException") {
				const errorType = error.error;
				let message;
				switch (errorType) {
					case "TOKEN_EXPIRED":
						message = "Your session has expired. Please reauthenticate.";
						break;
					case "USER_CREDENTIALS_CHANGED":
						message = "Unable to refresh credentials because of a change in your password. Please reauthenticate with your new password.";
						break;
					case "INSUFFICIENT_PERMISSIONS":
						message = "Unable to refresh credentials due to insufficient permissions. You may be missing permission for the 'CreateOAuth2Token' action.";
						break;
					default: message = `Failed to refresh token: ${String(error)}. Please re-authenticate using \`aws login\``;
				}
				throw new import_config.CredentialsProviderError(message, {
					logger: this.logger,
					tryNextLink: false
				});
			}
			if (new Date(freshToken.accessToken.expiresAt).getTime() > Date.now()) {
				this.logger?.warn?.(`Failed to refresh token: ${String(error)}. Using existing token until expiry.`);
				return this.toCredentials(freshToken.accessToken);
			}
			throw new import_config.CredentialsProviderError(`Failed to refresh token: ${String(error)}. Please re-authenticate using aws login`, { logger: this.logger });
		}
	}
	async loadToken() {
		const tokenFilePath = this.getTokenFilePath();
		try {
			const tokenData = await promises.readFile(tokenFilePath, "utf8");
			const token = JSON.parse(tokenData);
			const missingFields = [
				"accessToken",
				"clientId",
				"refreshToken",
				"dpopKey"
			].filter((k) => !token[k]);
			if (!token.accessToken?.accountId) missingFields.push("accountId");
			if (missingFields.length > 0) throw new import_config.CredentialsProviderError(`Token validation failed, missing fields: ${missingFields.join(", ")}`, {
				logger: this.logger,
				tryNextLink: false
			});
			return token;
		} catch (error) {
			throw new import_config.CredentialsProviderError(`Failed to load token from ${tokenFilePath}: ${String(error)}`, {
				logger: this.logger,
				tryNextLink: false
			});
		}
	}
	async saveToken(token) {
		const tokenFilePath = this.getTokenFilePath();
		const directory = dirname(tokenFilePath);
		try {
			await promises.mkdir(directory, { recursive: true });
		} catch (error) {}
		await promises.writeFile(tokenFilePath, JSON.stringify(token, null, 2), "utf8");
	}
	getTokenFilePath() {
		const directory = process.env.AWS_LOGIN_CACHE_DIRECTORY ?? join(homedir(), ".aws", "login", "cache");
		const loginSessionBytes = Buffer.from(this.loginSession, "utf8");
		const loginSessionSha256 = createHash("sha256").update(loginSessionBytes).digest("hex");
		return join(directory, `${loginSessionSha256}.json`);
	}
	derToRawSignature(derSignature) {
		let offset = 2;
		if (derSignature[offset] !== 2) throw new Error("Invalid DER signature");
		offset++;
		const rLength = derSignature[offset++];
		let r = derSignature.subarray(offset, offset + rLength);
		offset += rLength;
		if (derSignature[offset] !== 2) throw new Error("Invalid DER signature");
		offset++;
		const sLength = derSignature[offset++];
		let s = derSignature.subarray(offset, offset + sLength);
		r = r[0] === 0 ? r.subarray(1) : r;
		s = s[0] === 0 ? s.subarray(1) : s;
		const rPadded = Buffer.concat([Buffer.alloc(32 - r.length), r]);
		const sPadded = Buffer.concat([Buffer.alloc(32 - s.length), s]);
		return Buffer.concat([rPadded, sPadded]);
	}
	createDPoPInterceptor(middlewareStack) {
		middlewareStack.add((next) => async (args) => {
			if (import_protocols.HttpRequest.isInstance(args.request)) {
				const request = args.request;
				const actualEndpoint = `${request.protocol}//${request.hostname}${request.port ? `:${request.port}` : ""}${request.path}`;
				const dpop = await this.generateDpop(request.method, actualEndpoint);
				request.headers = {
					...request.headers,
					DPoP: dpop
				};
			}
			return next(args);
		}, {
			step: "finalizeRequest",
			name: "dpopInterceptor",
			override: true
		});
	}
	async generateDpop(method = "POST", endpoint) {
		const token = await this.loadToken();
		try {
			const privateKey = createPrivateKey({
				key: token.dpopKey,
				format: "pem",
				type: "sec1"
			});
			const publicDer = createPublicKey(privateKey).export({
				format: "der",
				type: "spki"
			});
			let pointStart = -1;
			for (let i = 0; i < publicDer.length; i++) if (publicDer[i] === 4) {
				pointStart = i;
				break;
			}
			const x = publicDer.slice(pointStart + 1, pointStart + 33);
			const y = publicDer.slice(pointStart + 33, pointStart + 65);
			const header = {
				alg: "ES256",
				typ: "dpop+jwt",
				jwk: {
					kty: "EC",
					crv: "P-256",
					x: x.toString("base64url"),
					y: y.toString("base64url")
				}
			};
			const payload = {
				jti: crypto.randomUUID(),
				htm: method,
				htu: endpoint,
				iat: Math.floor(Date.now() / 1e3)
			};
			const message = `${Buffer.from(JSON.stringify(header)).toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
			const asn1Signature = sign("sha256", Buffer.from(message), privateKey);
			return `${message}.${this.derToRawSignature(asn1Signature).toString("base64url")}`;
		} catch (error) {
			throw new import_config.CredentialsProviderError(`Failed to generate Dpop proof: ${error instanceof Error ? error.message : String(error)}`, {
				logger: this.logger,
				tryNextLink: false
			});
		}
	}
};
//#endregion
//#region node_modules/@aws-sdk/credential-provider-login/dist-es/fromLoginCredentials.js
var fromLoginCredentials = (init) => async ({ callerClientConfig } = {}) => {
	init?.logger?.debug?.("@aws-sdk/credential-providers - fromLoginCredentials");
	const profiles = await (0, import_config.parseKnownFiles)(init || {});
	const profileName = (0, import_config.getProfileName)({ profile: init?.profile ?? callerClientConfig?.profile });
	const profile = profiles[profileName];
	if (!profile?.login_session) throw new import_config.CredentialsProviderError(`Profile ${profileName} does not contain login_session.`, {
		tryNextLink: true,
		logger: init?.logger
	});
	const credentials = await new LoginCredentialsFetcher(profile, init, callerClientConfig).loadCredentials();
	return (0, import_client.setCredentialFeature)(credentials, "CREDENTIALS_LOGIN", "AD");
};
//#endregion
//#region node_modules/@aws-sdk/credential-provider-login/dist-es/index.js
var dist_es_exports = /* @__PURE__ */ __exportAll({ fromLoginCredentials: () => fromLoginCredentials });
//#endregion
export { dist_es_exports as t };
