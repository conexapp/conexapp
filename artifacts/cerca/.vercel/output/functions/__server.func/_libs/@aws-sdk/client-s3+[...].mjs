import { a as __toCommonJS, i as __require, n as __esmMin, r as __exportAll, t as __commonJSMin } from "../../_runtime.mjs";
import { a as require_retry, c as require_checksum, d as require_config, f as require_client, i as require_dist_cjs, l as require_serde, m as require_transport, n as require_flexible_checksums, o as require_protocols$1, p as require_schema, r as require_client$1, s as require_event_streams, t as require_sha, u as require_endpoints } from "./checksums+[...].mjs";
import { Readable } from "node:stream";
import node_https from "node:https";
import nodeHTTP2, { default as node_http2 } from "node:http2";
//#region node_modules/@smithy/signature-v4/dist-es/HeaderFormatter.js
function negate(bytes) {
	for (let i = 0; i < 8; i++) bytes[i] ^= 255;
	for (let i = 7; i > -1; i--) {
		bytes[i]++;
		if (bytes[i] !== 0) break;
	}
}
var import_serde$13, import_serde$14, HeaderFormatter, HEADER_VALUE_TYPE, UUID_PATTERN, Int64;
var init_HeaderFormatter = __esmMin((() => {
	import_serde$13 = require_serde();
	import_serde$14 = require_serde();
	HeaderFormatter = class {
		format(headers) {
			const chunks = [];
			for (const headerName in headers) {
				if (!(0, import_serde$13.hasOwn)(headers, headerName)) continue;
				const bytes = (0, import_serde$14.fromUtf8)(headerName);
				chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
			}
			const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
			let position = 0;
			for (const chunk of chunks) {
				out.set(chunk, position);
				position += chunk.byteLength;
			}
			return out;
		}
		formatHeaderValue(header) {
			switch (header.type) {
				case "boolean": return Uint8Array.from([header.value ? 0 : 1]);
				case "byte": return Uint8Array.from([2, header.value]);
				case "short":
					const shortView = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(3));
					shortView.setUint8(0, 3);
					shortView.setInt16(1, header.value, false);
					return new Uint8Array(shortView.buffer);
				case "integer":
					const intView = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(5));
					intView.setUint8(0, 4);
					intView.setInt32(1, header.value, false);
					return new Uint8Array(intView.buffer);
				case "long":
					const longBytes = /* @__PURE__ */ new Uint8Array(9);
					longBytes[0] = 5;
					longBytes.set(header.value.bytes, 1);
					return longBytes;
				case "binary":
					const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
					binView.setUint8(0, 6);
					binView.setUint16(1, header.value.byteLength, false);
					const binBytes = new Uint8Array(binView.buffer);
					binBytes.set(header.value, 3);
					return binBytes;
				case "string":
					const utf8Bytes = (0, import_serde$14.fromUtf8)(header.value);
					const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
					strView.setUint8(0, 7);
					strView.setUint16(1, utf8Bytes.byteLength, false);
					const strBytes = new Uint8Array(strView.buffer);
					strBytes.set(utf8Bytes, 3);
					return strBytes;
				case "timestamp":
					const tsBytes = /* @__PURE__ */ new Uint8Array(9);
					tsBytes[0] = 8;
					tsBytes.set(Int64.fromNumber(header.value.valueOf()).bytes, 1);
					return tsBytes;
				case "uuid":
					if (!UUID_PATTERN.test(header.value)) throw new Error(`Invalid UUID received: ${header.value}`);
					const uuidBytes = /* @__PURE__ */ new Uint8Array(17);
					uuidBytes[0] = 9;
					uuidBytes.set((0, import_serde$14.fromHex)(header.value.replace(/-/g, "")), 1);
					return uuidBytes;
			}
		}
	};
	(function(HEADER_VALUE_TYPE) {
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["boolTrue"] = 0] = "boolTrue";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["boolFalse"] = 1] = "boolFalse";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["byte"] = 2] = "byte";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["short"] = 3] = "short";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["integer"] = 4] = "integer";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["long"] = 5] = "long";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["byteArray"] = 6] = "byteArray";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["string"] = 7] = "string";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["timestamp"] = 8] = "timestamp";
		HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["uuid"] = 9] = "uuid";
	})(HEADER_VALUE_TYPE || (HEADER_VALUE_TYPE = {}));
	UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
	Int64 = class Int64 {
		bytes;
		constructor(bytes) {
			this.bytes = bytes;
			if (bytes.byteLength !== 8) throw new Error("Int64 buffers must be exactly 8 bytes");
		}
		static fromNumber(number) {
			if (number > 0x8000000000000000 || number < -0x8000000000000000) throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
			const bytes = /* @__PURE__ */ new Uint8Array(8);
			for (let i = 7, remaining = Math.abs(Math.round(number)); i > -1 && remaining > 0; i--, remaining /= 256) bytes[i] = remaining;
			if (number < 0) negate(bytes);
			return new Int64(bytes);
		}
		valueOf() {
			const bytes = this.bytes.slice(0);
			const negative = bytes[0] & 128;
			if (negative) negate(bytes);
			return parseInt((0, import_serde$14.toHex)(bytes), 16) * (negative ? -1 : 1);
		}
		toString() {
			return String(this.valueOf());
		}
	};
}));
//#endregion
//#region node_modules/@smithy/signature-v4/dist-es/constants.js
var ALGORITHM_QUERY_PARAM, CREDENTIAL_QUERY_PARAM, AMZ_DATE_QUERY_PARAM, SIGNED_HEADERS_QUERY_PARAM, EXPIRES_QUERY_PARAM, SIGNATURE_QUERY_PARAM, TOKEN_QUERY_PARAM, REGION_SET_PARAM, AUTH_HEADER, AMZ_DATE_HEADER, DATE_HEADER, GENERATED_HEADERS, SIGNATURE_HEADER, SHA256_HEADER, TOKEN_HEADER, HOST_HEADER, ALWAYS_UNSIGNABLE_HEADERS, PROXY_HEADER_PATTERN, SEC_HEADER_PATTERN, UNSIGNABLE_PATTERNS, ALGORITHM_IDENTIFIER, ALGORITHM_IDENTIFIER_V4A, EVENT_ALGORITHM_IDENTIFIER, UNSIGNED_PAYLOAD, KEY_TYPE_IDENTIFIER, MAX_PRESIGNED_TTL;
var init_constants$1 = __esmMin((() => {
	ALGORITHM_QUERY_PARAM = "X-Amz-Algorithm";
	CREDENTIAL_QUERY_PARAM = "X-Amz-Credential";
	AMZ_DATE_QUERY_PARAM = "X-Amz-Date";
	SIGNED_HEADERS_QUERY_PARAM = "X-Amz-SignedHeaders";
	EXPIRES_QUERY_PARAM = "X-Amz-Expires";
	SIGNATURE_QUERY_PARAM = "X-Amz-Signature";
	TOKEN_QUERY_PARAM = "X-Amz-Security-Token";
	REGION_SET_PARAM = "X-Amz-Region-Set";
	AUTH_HEADER = "authorization";
	AMZ_DATE_HEADER = AMZ_DATE_QUERY_PARAM.toLowerCase();
	DATE_HEADER = "date";
	GENERATED_HEADERS = [
		AUTH_HEADER,
		AMZ_DATE_HEADER,
		DATE_HEADER
	];
	SIGNATURE_HEADER = SIGNATURE_QUERY_PARAM.toLowerCase();
	SHA256_HEADER = "x-amz-content-sha256";
	TOKEN_HEADER = TOKEN_QUERY_PARAM.toLowerCase();
	HOST_HEADER = "host";
	ALWAYS_UNSIGNABLE_HEADERS = {
		authorization: true,
		"cache-control": true,
		connection: true,
		expect: true,
		from: true,
		"keep-alive": true,
		"max-forwards": true,
		pragma: true,
		referer: true,
		te: true,
		trailer: true,
		"transfer-encoding": true,
		upgrade: true,
		"user-agent": true,
		"x-amzn-trace-id": true
	};
	PROXY_HEADER_PATTERN = /^proxy-/;
	SEC_HEADER_PATTERN = /^sec-/;
	UNSIGNABLE_PATTERNS = [/^proxy-/i, /^sec-/i];
	ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256";
	ALGORITHM_IDENTIFIER_V4A = "AWS4-ECDSA-P256-SHA256";
	EVENT_ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256-PAYLOAD";
	UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
	KEY_TYPE_IDENTIFIER = "aws4_request";
	MAX_PRESIGNED_TTL = 604800;
}));
//#endregion
//#region node_modules/@smithy/signature-v4/dist-es/getCanonicalQuery.js
var import_serde$12, import_protocols$6, getCanonicalQuery;
var init_getCanonicalQuery = __esmMin((() => {
	import_serde$12 = require_serde();
	import_protocols$6 = require_protocols$1();
	init_constants$1();
	getCanonicalQuery = ({ query = {} }) => {
		const keys = [];
		const serialized = {};
		for (const key in query) {
			if (!(0, import_serde$12.hasOwn)(query, key)) continue;
			if (key.toLowerCase() === "x-amz-signature") continue;
			const encodedKey = (0, import_protocols$6.escapeUri)(key);
			keys.push(encodedKey);
			const value = query[key];
			if (typeof value === "string") serialized[encodedKey] = `${encodedKey}=${(0, import_protocols$6.escapeUri)(value)}`;
			else if (Array.isArray(value)) serialized[encodedKey] = value.slice(0).reduce((encoded, value) => encoded.concat([`${encodedKey}=${(0, import_protocols$6.escapeUri)(value)}`]), []).sort().join("&");
		}
		return keys.sort().map((key) => serialized[key]).filter((serialized) => serialized).join("&");
	};
}));
//#endregion
//#region node_modules/@smithy/signature-v4/dist-es/utilDate.js
var iso8601, toDate;
var init_utilDate = __esmMin((() => {
	iso8601 = (time) => toDate(time).toISOString().replace(/\.\d{3}Z$/, "Z");
	toDate = (time) => {
		if (typeof time === "number") return /* @__PURE__ */ new Date(time * 1e3);
		if (typeof time === "string") {
			if (Number(time)) return /* @__PURE__ */ new Date(Number(time) * 1e3);
			return new Date(time);
		}
		return time;
	};
}));
//#endregion
//#region node_modules/@smithy/signature-v4/dist-es/SignatureV4Base.js
var import_client$2, import_protocols$5, import_serde$11, SignatureV4Base;
var init_SignatureV4Base = __esmMin((() => {
	import_client$2 = require_client();
	import_protocols$5 = require_protocols$1();
	import_serde$11 = require_serde();
	init_getCanonicalQuery();
	init_utilDate();
	SignatureV4Base = class {
		service;
		regionProvider;
		credentialProvider;
		sha256;
		uriEscapePath;
		applyChecksum;
		constructor({ applyChecksum, credentials, region, service, sha256, uriEscapePath = true }) {
			this.service = service;
			this.sha256 = sha256;
			this.uriEscapePath = uriEscapePath;
			this.applyChecksum = typeof applyChecksum === "boolean" ? applyChecksum : true;
			this.regionProvider = (0, import_client$2.normalizeProvider)(region);
			this.credentialProvider = (0, import_client$2.normalizeProvider)(credentials);
		}
		createCanonicalRequest(request, canonicalHeaders, payloadHash) {
			const sortedHeaders = Object.keys(canonicalHeaders).sort();
			return `${request.method}
${this.getCanonicalPath(request)}
${getCanonicalQuery(request)}
${sortedHeaders.map((name) => `${name}:${canonicalHeaders[name]}`).join("\n")}

${sortedHeaders.join(";")}
${payloadHash}`;
		}
		async createStringToSign(longDate, credentialScope, canonicalRequest, algorithmIdentifier) {
			const hash = new this.sha256();
			hash.update((0, import_serde$11.toUint8Array)(canonicalRequest));
			const hashedRequest = await hash.digest();
			return `${algorithmIdentifier}
${longDate}
${credentialScope}
${(0, import_serde$11.toHex)(hashedRequest)}`;
		}
		getCanonicalPath({ path }) {
			if (this.uriEscapePath) {
				const normalizedPathSegments = [];
				for (const pathSegment of path.split("/")) {
					if (pathSegment?.length === 0) continue;
					if (pathSegment === ".") continue;
					if (pathSegment === "..") normalizedPathSegments.pop();
					else normalizedPathSegments.push(pathSegment);
				}
				const normalizedPath = `${path?.startsWith("/") ? "/" : ""}${normalizedPathSegments.join("/")}${normalizedPathSegments.length > 0 && path?.endsWith("/") ? "/" : ""}`;
				return (0, import_protocols$5.escapeUri)(normalizedPath).replace(/%2F/g, "/");
			}
			return path;
		}
		validateResolvedCredentials(credentials) {
			if (typeof credentials !== "object" || typeof credentials.accessKeyId !== "string" || typeof credentials.secretAccessKey !== "string") throw new Error("Resolved credential object is not valid");
		}
		formatDate(now) {
			const longDate = iso8601(now).replace(/[-:]/g, "");
			return {
				longDate,
				shortDate: longDate.slice(0, 8)
			};
		}
		getCanonicalHeaderList(headers) {
			return Object.keys(headers).sort().join(";");
		}
	};
}));
//#endregion
//#region node_modules/@smithy/signature-v4/dist-es/credentialDerivation.js
var import_serde$10, signingKeyCache, cacheQueue, createScope, getSigningKey, clearCredentialCache, hmac;
var init_credentialDerivation = __esmMin((() => {
	import_serde$10 = require_serde();
	init_constants$1();
	signingKeyCache = {};
	cacheQueue = [];
	createScope = (shortDate, region, service) => `${shortDate}/${region}/${service}/${KEY_TYPE_IDENTIFIER}`;
	getSigningKey = async (sha256Constructor, credentials, shortDate, region, service) => {
		const credsHash = await hmac(sha256Constructor, credentials.secretAccessKey, credentials.accessKeyId);
		const cacheKey = `${shortDate}:${region}:${service}:${(0, import_serde$10.toHex)(credsHash)}:${credentials.sessionToken}`;
		if (cacheKey in signingKeyCache) return signingKeyCache[cacheKey];
		cacheQueue.push(cacheKey);
		while (cacheQueue.length > 50) delete signingKeyCache[cacheQueue.shift()];
		let key = `AWS4${credentials.secretAccessKey}`;
		for (const signable of [
			shortDate,
			region,
			service,
			KEY_TYPE_IDENTIFIER
		]) key = await hmac(sha256Constructor, key, signable);
		return signingKeyCache[cacheKey] = key;
	};
	clearCredentialCache = () => {
		cacheQueue.length = 0;
		Object.keys(signingKeyCache).forEach((cacheKey) => {
			delete signingKeyCache[cacheKey];
		});
	};
	hmac = (ctor, secret, data) => {
		const hash = new ctor(secret);
		hash.update((0, import_serde$10.toUint8Array)(data));
		return hash.digest();
	};
}));
//#endregion
//#region node_modules/@smithy/signature-v4/dist-es/getCanonicalHeaders.js
var getCanonicalHeaders;
var init_getCanonicalHeaders = __esmMin((() => {
	init_constants$1();
	getCanonicalHeaders = ({ headers }, unsignableHeaders, signableHeaders) => {
		const canonical = {};
		for (const headerName of Object.keys(headers).sort()) {
			if (headers[headerName] == void 0) continue;
			const canonicalHeaderName = headerName.toLowerCase();
			if (canonicalHeaderName in ALWAYS_UNSIGNABLE_HEADERS || unsignableHeaders?.has(canonicalHeaderName) || PROXY_HEADER_PATTERN.test(canonicalHeaderName) || SEC_HEADER_PATTERN.test(canonicalHeaderName)) {
				if (!signableHeaders || signableHeaders && !signableHeaders.has(canonicalHeaderName)) continue;
			}
			canonical[canonicalHeaderName] = headers[headerName].replace(/[\r\n]/g, " ").replace(/[ \t]+/g, " ").replace(/^ | $/g, "");
		}
		return canonical;
	};
}));
//#endregion
//#region node_modules/@smithy/signature-v4/dist-es/getPayloadHash.js
var import_serde$8, import_serde$9, getPayloadHash;
var init_getPayloadHash = __esmMin((() => {
	import_serde$8 = require_serde();
	import_serde$9 = require_serde();
	init_constants$1();
	getPayloadHash = async ({ headers, body }, hashConstructor) => {
		for (const headerName in headers) {
			if (!(0, import_serde$8.hasOwn)(headers, headerName)) continue;
			if (headerName.toLowerCase() === "x-amz-content-sha256") return headers[headerName];
		}
		if (body == void 0) return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
		else if (typeof body === "string" || ArrayBuffer.isView(body) || (0, import_serde$9.isArrayBuffer)(body)) {
			const hashCtor = new hashConstructor();
			hashCtor.update((0, import_serde$9.toUint8Array)(body));
			return (0, import_serde$9.toHex)(await hashCtor.digest());
		}
		return UNSIGNED_PAYLOAD;
	};
}));
//#endregion
//#region node_modules/@smithy/signature-v4/dist-es/headerUtil.js
var import_serde$7, hasHeader;
var init_headerUtil = __esmMin((() => {
	import_serde$7 = require_serde();
	hasHeader = (soughtHeader, headers) => {
		soughtHeader = soughtHeader.toLowerCase();
		for (const headerName in headers) {
			if (!(0, import_serde$7.hasOwn)(headers, headerName)) continue;
			if (soughtHeader === headerName.toLowerCase()) return true;
		}
		return false;
	};
}));
//#endregion
//#region node_modules/@smithy/signature-v4/dist-es/moveHeadersToQuery.js
var import_serde$6, import_protocols$4, moveHeadersToQuery;
var init_moveHeadersToQuery = __esmMin((() => {
	import_serde$6 = require_serde();
	import_protocols$4 = require_protocols$1();
	moveHeadersToQuery = (request, options = {}) => {
		const { headers, query = {} } = import_protocols$4.HttpRequest.clone(request);
		for (const name in headers) {
			if (!(0, import_serde$6.hasOwn)(headers, name)) continue;
			const lname = name.toLowerCase();
			if (lname.slice(0, 6) === "x-amz-" && !options.unhoistableHeaders?.has(lname) || options.hoistableHeaders?.has(lname)) {
				query[name] = headers[name];
				delete headers[name];
			}
		}
		return {
			...request,
			headers,
			query
		};
	};
}));
//#endregion
//#region node_modules/@smithy/signature-v4/dist-es/prepareRequest.js
var import_serde$5, import_protocols$3, prepareRequest;
var init_prepareRequest = __esmMin((() => {
	import_serde$5 = require_serde();
	import_protocols$3 = require_protocols$1();
	init_constants$1();
	prepareRequest = (request) => {
		request = import_protocols$3.HttpRequest.clone(request);
		for (const headerName in request.headers) {
			if (!(0, import_serde$5.hasOwn)(request.headers, headerName)) continue;
			if (GENERATED_HEADERS.indexOf(headerName.toLowerCase()) > -1) delete request.headers[headerName];
		}
		return request;
	};
}));
//#endregion
//#region node_modules/@smithy/signature-v4/dist-es/SignatureV4.js
var import_serde$4, SignatureV4;
var init_SignatureV4 = __esmMin((() => {
	import_serde$4 = require_serde();
	init_HeaderFormatter();
	init_SignatureV4Base();
	init_constants$1();
	init_credentialDerivation();
	init_getCanonicalHeaders();
	init_getPayloadHash();
	init_headerUtil();
	init_moveHeadersToQuery();
	init_prepareRequest();
	SignatureV4 = class extends SignatureV4Base {
		headerFormatter = new HeaderFormatter();
		constructor({ applyChecksum, credentials, region, service, sha256, uriEscapePath = true }) {
			super({
				applyChecksum,
				credentials,
				region,
				service,
				sha256,
				uriEscapePath
			});
		}
		async presign(originalRequest, options = {}) {
			const { signingDate = /* @__PURE__ */ new Date(), expiresIn = 3600, unsignableHeaders, unhoistableHeaders, signableHeaders, hoistableHeaders, signingRegion, signingService } = options;
			const credentials = await this.credentialProvider();
			this.validateResolvedCredentials(credentials);
			const region = signingRegion ?? await this.regionProvider();
			const { longDate, shortDate } = this.formatDate(signingDate);
			if (expiresIn > 604800) return Promise.reject("Signature version 4 presigned URLs must have an expiration date less than one week in the future");
			const scope = createScope(shortDate, region, signingService ?? this.service);
			const request = moveHeadersToQuery(prepareRequest(originalRequest), {
				unhoistableHeaders,
				hoistableHeaders
			});
			if (credentials.sessionToken) request.query[TOKEN_QUERY_PARAM] = credentials.sessionToken;
			request.query[ALGORITHM_QUERY_PARAM] = ALGORITHM_IDENTIFIER;
			request.query[CREDENTIAL_QUERY_PARAM] = `${credentials.accessKeyId}/${scope}`;
			request.query[AMZ_DATE_QUERY_PARAM] = longDate;
			request.query[EXPIRES_QUERY_PARAM] = expiresIn.toString(10);
			const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
			request.query[SIGNED_HEADERS_QUERY_PARAM] = this.getCanonicalHeaderList(canonicalHeaders);
			request.query[SIGNATURE_QUERY_PARAM] = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, await getPayloadHash(originalRequest, this.sha256)));
			return request;
		}
		async sign(toSign, options) {
			if (typeof toSign === "string") return this.signString(toSign, options);
			else if (toSign.headers && toSign.payload) return this.signEvent(toSign, options);
			else if (toSign.message) return this.signMessage(toSign, options);
			else return this.signRequest(toSign, options);
		}
		async signEvent({ headers, payload }, { signingDate = /* @__PURE__ */ new Date(), priorSignature, signingRegion, signingService, eventStreamCredentials }) {
			const region = signingRegion ?? await this.regionProvider();
			const { shortDate, longDate } = this.formatDate(signingDate);
			const scope = createScope(shortDate, region, signingService ?? this.service);
			const hashedPayload = await getPayloadHash({
				headers: {},
				body: payload
			}, this.sha256);
			const hash = new this.sha256();
			hash.update(headers);
			const hashedHeaders = (0, import_serde$4.toHex)(await hash.digest());
			const stringToSign = [
				EVENT_ALGORITHM_IDENTIFIER,
				longDate,
				scope,
				priorSignature,
				hashedHeaders,
				hashedPayload
			].join("\n");
			return this.signString(stringToSign, {
				signingDate,
				signingRegion: region,
				signingService,
				eventStreamCredentials
			});
		}
		async signMessage(signableMessage, { signingDate = /* @__PURE__ */ new Date(), signingRegion, signingService, eventStreamCredentials }) {
			return this.signEvent({
				headers: this.headerFormatter.format(signableMessage.message.headers),
				payload: signableMessage.message.body
			}, {
				signingDate,
				signingRegion,
				signingService,
				priorSignature: signableMessage.priorSignature,
				eventStreamCredentials
			}).then((signature) => {
				return {
					message: signableMessage.message,
					signature
				};
			});
		}
		async signString(stringToSign, { signingDate = /* @__PURE__ */ new Date(), signingRegion, signingService, eventStreamCredentials } = {}) {
			const credentials = eventStreamCredentials ?? await this.credentialProvider();
			this.validateResolvedCredentials(credentials);
			const region = signingRegion ?? await this.regionProvider();
			const { shortDate } = this.formatDate(signingDate);
			const hash = new this.sha256(await this.getSigningKey(credentials, region, shortDate, signingService));
			hash.update((0, import_serde$4.toUint8Array)(stringToSign));
			return (0, import_serde$4.toHex)(await hash.digest());
		}
		async signRequest(requestToSign, { signingDate = /* @__PURE__ */ new Date(), signableHeaders, unsignableHeaders, signingRegion, signingService } = {}) {
			const credentials = await this.credentialProvider();
			this.validateResolvedCredentials(credentials);
			const region = signingRegion ?? await this.regionProvider();
			const request = prepareRequest(requestToSign);
			const { longDate, shortDate } = this.formatDate(signingDate);
			const scope = createScope(shortDate, region, signingService ?? this.service);
			request.headers[AMZ_DATE_HEADER] = longDate;
			if (credentials.sessionToken) request.headers[TOKEN_HEADER] = credentials.sessionToken;
			const payloadHash = await getPayloadHash(request, this.sha256);
			if (!hasHeader("x-amz-content-sha256", request.headers) && this.applyChecksum) request.headers[SHA256_HEADER] = payloadHash;
			const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
			const signature = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, payloadHash));
			request.headers[AUTH_HEADER] = `${ALGORITHM_IDENTIFIER} Credential=${credentials.accessKeyId}/${scope}, SignedHeaders=${this.getCanonicalHeaderList(canonicalHeaders)}, Signature=${signature}`;
			return request;
		}
		async getSignature(longDate, credentialScope, keyPromise, canonicalRequest) {
			const stringToSign = await this.createStringToSign(longDate, credentialScope, canonicalRequest, ALGORITHM_IDENTIFIER);
			const hash = new this.sha256(await keyPromise);
			hash.update((0, import_serde$4.toUint8Array)(stringToSign));
			return (0, import_serde$4.toHex)(await hash.digest());
		}
		getSigningKey(credentials, region, shortDate, service) {
			return getSigningKey(this.sha256, credentials, shortDate, region, service || this.service);
		}
	};
}));
//#endregion
//#region node_modules/@smithy/signature-v4/dist-es/signature-v4a-container.js
var signatureV4aContainer;
var init_signature_v4a_container = __esmMin((() => {
	signatureV4aContainer = { SignatureV4a: null };
}));
//#endregion
//#region node_modules/@smithy/signature-v4/dist-es/index.js
var dist_es_exports$5 = /* @__PURE__ */ __exportAll({
	ALGORITHM_IDENTIFIER: () => ALGORITHM_IDENTIFIER,
	ALGORITHM_IDENTIFIER_V4A: () => ALGORITHM_IDENTIFIER_V4A,
	ALGORITHM_QUERY_PARAM: () => ALGORITHM_QUERY_PARAM,
	ALWAYS_UNSIGNABLE_HEADERS: () => ALWAYS_UNSIGNABLE_HEADERS,
	AMZ_DATE_HEADER: () => AMZ_DATE_HEADER,
	AMZ_DATE_QUERY_PARAM: () => AMZ_DATE_QUERY_PARAM,
	AUTH_HEADER: () => AUTH_HEADER,
	CREDENTIAL_QUERY_PARAM: () => CREDENTIAL_QUERY_PARAM,
	DATE_HEADER: () => DATE_HEADER,
	EVENT_ALGORITHM_IDENTIFIER: () => EVENT_ALGORITHM_IDENTIFIER,
	EXPIRES_QUERY_PARAM: () => EXPIRES_QUERY_PARAM,
	GENERATED_HEADERS: () => GENERATED_HEADERS,
	HOST_HEADER: () => HOST_HEADER,
	KEY_TYPE_IDENTIFIER: () => KEY_TYPE_IDENTIFIER,
	MAX_CACHE_SIZE: () => 50,
	MAX_PRESIGNED_TTL: () => MAX_PRESIGNED_TTL,
	PROXY_HEADER_PATTERN: () => PROXY_HEADER_PATTERN,
	REGION_SET_PARAM: () => REGION_SET_PARAM,
	SEC_HEADER_PATTERN: () => SEC_HEADER_PATTERN,
	SHA256_HEADER: () => SHA256_HEADER,
	SIGNATURE_HEADER: () => SIGNATURE_HEADER,
	SIGNATURE_QUERY_PARAM: () => SIGNATURE_QUERY_PARAM,
	SIGNED_HEADERS_QUERY_PARAM: () => SIGNED_HEADERS_QUERY_PARAM,
	SignatureV4: () => SignatureV4,
	SignatureV4Base: () => SignatureV4Base,
	TOKEN_HEADER: () => TOKEN_HEADER,
	TOKEN_QUERY_PARAM: () => TOKEN_QUERY_PARAM,
	UNSIGNABLE_PATTERNS: () => UNSIGNABLE_PATTERNS,
	UNSIGNED_PAYLOAD: () => UNSIGNED_PAYLOAD,
	clearCredentialCache: () => clearCredentialCache,
	createScope: () => createScope,
	getCanonicalHeaders: () => getCanonicalHeaders,
	getCanonicalQuery: () => getCanonicalQuery,
	getPayloadHash: () => getPayloadHash,
	getSigningKey: () => getSigningKey,
	hasHeader: () => hasHeader,
	moveHeadersToQuery: () => moveHeadersToQuery,
	prepareRequest: () => prepareRequest,
	signatureV4aContainer: () => signatureV4aContainer
});
var init_dist_es$3 = __esmMin((() => {
	init_SignatureV4();
	init_constants$1();
	init_getCanonicalHeaders();
	init_getCanonicalQuery();
	init_getPayloadHash();
	init_moveHeadersToQuery();
	init_prepareRequest();
	init_credentialDerivation();
	init_SignatureV4Base();
	init_headerUtil();
	init_signature_v4a_container();
}));
//#endregion
//#region node_modules/@aws-sdk/signature-v4-multi-region/dist-es/signature-v4-crt-container.js
var signatureV4CrtContainer;
var init_signature_v4_crt_container = __esmMin((() => {
	signatureV4CrtContainer = { CrtSignerV4: null };
}));
//#endregion
//#region node_modules/@aws-sdk/signature-v4-multi-region/dist-es/SignatureV4SignWithCredentials.js
function getCredentialsWithoutSessionToken(credentials) {
	return {
		accessKeyId: credentials.accessKeyId,
		secretAccessKey: credentials.secretAccessKey,
		expiration: credentials.expiration
	};
}
function setSingleOverride(privateAccess, credentialsWithoutSessionToken) {
	const currentCredentialProvider = privateAccess.credentialProvider;
	privateAccess.credentialProvider = () => {
		privateAccess.credentialProvider = currentCredentialProvider;
		return Promise.resolve(credentialsWithoutSessionToken);
	};
}
var SESSION_TOKEN_QUERY_PARAM, SESSION_TOKEN_HEADER, SignatureV4SignWithCredentials;
var init_SignatureV4SignWithCredentials = __esmMin((() => {
	init_dist_es$3();
	SESSION_TOKEN_QUERY_PARAM = "X-Amz-S3session-Token";
	SESSION_TOKEN_HEADER = SESSION_TOKEN_QUERY_PARAM.toLowerCase();
	SignatureV4SignWithCredentials = class extends SignatureV4 {
		async signWithCredentials(requestToSign, credentials, options) {
			const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
			requestToSign.headers[SESSION_TOKEN_HEADER] = credentials.sessionToken;
			const privateAccess = this;
			setSingleOverride(privateAccess, credentialsWithoutSessionToken);
			return privateAccess.signRequest(requestToSign, options ?? {});
		}
		async presignWithCredentials(requestToSign, credentials, options) {
			const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
			delete requestToSign.headers[SESSION_TOKEN_HEADER];
			requestToSign.headers[SESSION_TOKEN_QUERY_PARAM] = credentials.sessionToken;
			requestToSign.query = requestToSign.query ?? {};
			requestToSign.query[SESSION_TOKEN_QUERY_PARAM] = credentials.sessionToken;
			setSingleOverride(this, credentialsWithoutSessionToken);
			return this.presign(requestToSign, options);
		}
	};
}));
//#endregion
//#region node_modules/@aws-sdk/signature-v4-multi-region/dist-es/SignatureV4MultiRegion.js
var SignatureV4MultiRegion;
var init_SignatureV4MultiRegion = __esmMin((() => {
	init_dist_es$3();
	init_signature_v4_crt_container();
	init_SignatureV4SignWithCredentials();
	SignatureV4MultiRegion = class {
		sigv4aSigner;
		sigv4Signer;
		signerOptions;
		static sigv4aDependency() {
			if (typeof signatureV4CrtContainer.CrtSignerV4 === "function") return "crt";
			else if (typeof signatureV4aContainer.SignatureV4a === "function") return "js";
			return "none";
		}
		constructor(options) {
			this.sigv4Signer = new SignatureV4SignWithCredentials(options);
			this.signerOptions = options;
		}
		async sign(requestToSign, options = {}) {
			if (options.signingRegion === "*") return this.getSigv4aSigner().sign(requestToSign, options);
			return this.sigv4Signer.sign(requestToSign, options);
		}
		async signWithCredentials(requestToSign, credentials, options = {}) {
			if (options.signingRegion === "*") {
				const signer = this.getSigv4aSigner();
				const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
				if (CrtSignerV4 && signer instanceof CrtSignerV4) return signer.signWithCredentials(requestToSign, credentials, options);
				else throw new Error("signWithCredentials with signingRegion '*' is only supported when using the CRT dependency @aws-sdk/signature-v4-crt. Please check whether you have installed the \"@aws-sdk/signature-v4-crt\" package explicitly. You must also register the package by calling [require(\"@aws-sdk/signature-v4-crt\");] or an ESM equivalent such as [import \"@aws-sdk/signature-v4-crt\";]. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
			}
			return this.sigv4Signer.signWithCredentials(requestToSign, credentials, options);
		}
		async presign(originalRequest, options = {}) {
			if (options.signingRegion === "*") {
				const signer = this.getSigv4aSigner();
				const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
				if (CrtSignerV4 && signer instanceof CrtSignerV4) return signer.presign(originalRequest, options);
				else throw new Error("presign with signingRegion '*' is only supported when using the CRT dependency @aws-sdk/signature-v4-crt. Please check whether you have installed the \"@aws-sdk/signature-v4-crt\" package explicitly. You must also register the package by calling [require(\"@aws-sdk/signature-v4-crt\");] or an ESM equivalent such as [import \"@aws-sdk/signature-v4-crt\";]. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
			}
			return this.sigv4Signer.presign(originalRequest, options);
		}
		async presignWithCredentials(originalRequest, credentials, options = {}) {
			if (options.signingRegion === "*") throw new Error("Method presignWithCredentials is not supported for [signingRegion=*].");
			return this.sigv4Signer.presignWithCredentials(originalRequest, credentials, options);
		}
		getSigv4aSigner() {
			if (!this.sigv4aSigner) {
				const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
				const JsSigV4aSigner = signatureV4aContainer.SignatureV4a;
				if (this.signerOptions.runtime === "node") {
					if (!CrtSignerV4 && !JsSigV4aSigner) throw new Error("Neither CRT nor JS SigV4a implementation is available. Please load either @aws-sdk/signature-v4-crt or @aws-sdk/signature-v4a. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
					if (CrtSignerV4 && typeof CrtSignerV4 === "function") this.sigv4aSigner = new CrtSignerV4({
						...this.signerOptions,
						signingAlgorithm: 1
					});
					else if (JsSigV4aSigner && typeof JsSigV4aSigner === "function") this.sigv4aSigner = new JsSigV4aSigner({ ...this.signerOptions });
					else throw new Error("Available SigV4a implementation is not a valid constructor. Please ensure you've properly imported @aws-sdk/signature-v4-crt or @aws-sdk/signature-v4a.For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
				} else {
					if (!JsSigV4aSigner || typeof JsSigV4aSigner !== "function") throw new Error("JS SigV4a implementation is not available or not a valid constructor. Please check whether you have installed the @aws-sdk/signature-v4a package explicitly. The CRT implementation is not available for browsers. You must also register the package by calling [require('@aws-sdk/signature-v4a');] or an ESM equivalent such as [import '@aws-sdk/signature-v4a';]. For more information please go to https://github.com/aws/aws-sdk-js-v3#using-javascript-non-crt-implementation-of-sigv4a");
					this.sigv4aSigner = new JsSigV4aSigner({ ...this.signerOptions });
				}
			}
			return this.sigv4aSigner;
		}
	};
}));
//#endregion
//#region node_modules/@aws-sdk/signature-v4-multi-region/dist-es/index.js
var dist_es_exports$4 = /* @__PURE__ */ __exportAll({
	SignatureV4MultiRegion: () => SignatureV4MultiRegion,
	SignatureV4SignWithCredentials: () => SignatureV4SignWithCredentials,
	signatureV4CrtContainer: () => signatureV4CrtContainer
});
var init_dist_es$2 = __esmMin((() => {
	init_SignatureV4MultiRegion();
	init_signature_v4_crt_container();
	init_SignatureV4SignWithCredentials();
}));
//#endregion
//#region node_modules/@aws-sdk/core/dist-cjs/submodules/util/index.js
var require_util = /* @__PURE__ */ __commonJSMin(((exports) => {
	var { buildQueryString } = require_protocols$1();
	var validate = (str) => typeof str === "string" && str.indexOf("arn:") === 0 && str.split(":").length >= 6;
	var parse = (arn) => {
		const segments = arn.split(":");
		if (segments.length < 6 || segments[0] !== "arn") throw new Error("Malformed ARN");
		const [, partition, service, region, accountId, ...resource] = segments;
		return {
			partition,
			service,
			region,
			accountId,
			resource: resource.join(":")
		};
	};
	var build = (arnObject) => {
		const { partition = "aws", service, region, accountId, resource } = arnObject;
		if ([
			service,
			region,
			accountId,
			resource
		].some((segment) => typeof segment !== "string")) throw new Error("Input ARN object is invalid");
		return `arn:${partition}:${service}:${region}:${accountId}:${resource}`;
	};
	function formatUrl(request) {
		const { port, query } = request;
		let { protocol, path, hostname } = request;
		if (protocol && protocol.slice(-1) !== ":") protocol += ":";
		if (port) hostname += `:${port}`;
		if (path && path.charAt(0) !== "/") path = `/${path}`;
		let queryString = query ? buildQueryString(query) : "";
		if (queryString && queryString[0] !== "?") queryString = `?${queryString}`;
		let auth = "";
		if (request.username != null || request.password != null) auth = `${request.username ?? ""}:${request.password ?? ""}@`;
		let fragment = "";
		if (request.fragment) fragment = `#${request.fragment}`;
		return `${protocol}//${auth}${hostname}${path}${queryString}${fragment}`;
	}
	function hasOwn(container, key) {
		return Object.prototype.hasOwnProperty.call(container, key);
	}
	exports.build = build;
	exports.formatUrl = formatUrl;
	exports.hasOwn = hasOwn;
	exports.parse = parse;
	exports.validate = validate;
}));
//#endregion
//#region node_modules/@smithy/core/dist-cjs/submodules/cbor/index.js
var require_cbor = /* @__PURE__ */ __commonJSMin(((exports) => {
	var { nv, NumericValue, calculateBodyLength, generateIdempotencyToken, fromBase64, _parseEpochTimestamp } = require_serde();
	var { hasOwn, getSmithyContext } = require_transport();
	var { HttpRequest, collectBody, SerdeContext, RpcProtocol } = require_protocols$1();
	var { NormalizedSchema, deref, TypeRegistry } = require_schema();
	var majorUint64 = 0;
	var majorNegativeInt64 = 1;
	var majorUnstructuredByteString = 2;
	var majorUtf8String = 3;
	var majorList = 4;
	var majorMap = 5;
	var majorTag = 6;
	var majorSpecial = 7;
	var specialFalse = 20;
	var specialTrue = 21;
	var specialNull = 22;
	var specialUndefined = 23;
	var extendedOneByte = 24;
	var extendedFloat16 = 25;
	var extendedFloat32 = 26;
	var extendedFloat64 = 27;
	var minorIndefinite = 31;
	function alloc(size) {
		return typeof Buffer !== "undefined" ? Buffer.alloc(size) : new Uint8Array(size);
	}
	var tagSymbol = Symbol("@smithy/core/cbor::tagSymbol");
	function tag(data) {
		data[tagSymbol] = true;
		return data;
	}
	var USE_BUFFER$3 = typeof Buffer !== "undefined";
	var textDecoder$1 = new TextDecoder();
	var payload$1 = alloc(0);
	var isBuffer$1 = false;
	var dataView$2 = new DataView(payload$1.buffer, payload$1.byteOffset, payload$1.byteLength);
	var _offset = 0;
	function setPayload(bytes) {
		payload$1 = bytes;
		isBuffer$1 = USE_BUFFER$3 && payload$1 instanceof Buffer;
		dataView$2 = new DataView(payload$1.buffer, payload$1.byteOffset, payload$1.byteLength);
	}
	function decode(at, to) {
		if (at >= to) throw new Error("unexpected end of (decode) payload.");
		const major = (payload$1[at] & 224) >> 5;
		const minor = payload$1[at] & 31;
		if (minor === minorIndefinite && 2 <= major && major <= 5) return decodeIndefinite(at, to);
		switch (major) {
			case majorUint64:
			case majorNegativeInt64:
			case majorTag: {
				let unsignedInt;
				let offset;
				if (minor < 24) {
					unsignedInt = minor;
					offset = 1;
				} else switch (minor) {
					case extendedOneByte:
						if (to - at < 2) overflow$1(1);
						unsignedInt = payload$1[at + 1];
						offset = 2;
						break;
					case extendedFloat16:
						if (to - at < 3) overflow$1(2);
						unsignedInt = dataView$2.getUint16(at + 1);
						offset = 3;
						break;
					case extendedFloat32:
						if (to - at < 5) overflow$1(4);
						unsignedInt = dataView$2.getUint32(at + 1);
						offset = 5;
						break;
					case extendedFloat64:
						if (to - at < 9) overflow$1(8);
						{
							const hi = dataView$2.getUint32(at + 1);
							if (hi < 2097152) unsignedInt = hi * 4294967296 + dataView$2.getUint32(at + 5);
							else unsignedInt = dataView$2.getBigUint64(at + 1);
						}
						offset = 9;
						break;
					default: unexpectedMinor(minor);
				}
				if (major === majorUint64) {
					_offset = offset;
					return castBigInt$1(unsignedInt);
				} else if (major === majorNegativeInt64) {
					let negativeInt;
					if (typeof unsignedInt === "bigint") negativeInt = BigInt(-1) - unsignedInt;
					else negativeInt = -1 - unsignedInt;
					_offset = offset;
					return castBigInt$1(negativeInt);
				} else return decodeTagValue(at, to, minor, unsignedInt, offset);
			}
			case majorUtf8String: return decodeUtf8String(at, to);
			case majorMap: return decodeMap(at, to);
			case majorList: return decodeList(at, to);
			case majorUnstructuredByteString: return decodeUnstructuredByteString(at, to);
			default: return decodeSpecial(at, to);
		}
	}
	function decodeIndefinite(at, to) {
		const major = (payload$1[at] & 224) >> 5;
		if ((payload$1[at] & 31) === minorIndefinite) switch (major) {
			case majorUtf8String: return decodeUtf8StringIndefinite(at, to);
			case majorMap: return decodeMapIndefinite(at, to);
			case majorList: return decodeListIndefinite(at, to);
			case majorUnstructuredByteString: return decodeUnstructuredByteStringIndefinite(at, to);
		}
	}
	function bytesToFloat16$1(a, b) {
		const sign = a >> 7;
		const exponent = (a & 124) >> 2;
		const fraction = (a & 3) << 8 | b;
		const scalar = sign === 0 ? 1 : -1;
		if (exponent === 0) {
			if (fraction === 0) return 0;
			return scalar * (Math.pow(2, -14) * (fraction / 1024));
		} else if (exponent === 31) {
			if (fraction === 0) return scalar * Infinity;
			return NaN;
		}
		return scalar * (Math.pow(2, exponent - 15) * (1 + fraction / 1024));
	}
	function decodeMap(at, to) {
		const mapDataLength = decodeCount$1(at, to);
		if (mapDataLength < 25) return decodeMapSmall(at, to, mapDataLength);
		return decodeMapLarge(at, to, mapDataLength);
	}
	function decodeMapLarge(at, to, mapDataLength) {
		const offset = _offset;
		at += offset;
		const base = at;
		const map = Object.create(null);
		for (let i = 0; i < mapDataLength; ++i) {
			const key = decodeUtf8String(at, to);
			at += _offset;
			if ((payload$1[at] & 224) >> 5 === majorUtf8String) map[key] = decodeUtf8String(at, to);
			else map[key] = decode(at, to);
			at += _offset;
		}
		_offset = offset + (at - base);
		Object.setPrototypeOf(map, Object.prototype);
		return map;
	}
	function decodeMapSmall(at, to, mapDataLength) {
		const offset = _offset;
		at += offset;
		const base = at;
		const map = {};
		for (let i = 0; i < mapDataLength; ++i) {
			const key = decodeUtf8String(at, to);
			at += _offset;
			map[key] = decode(at, to);
			at += _offset;
		}
		_offset = offset + (at - base);
		return map;
	}
	function decodeList(at, to) {
		const listDataLength = decodeCount$1(at, to);
		const offset = _offset;
		at += offset;
		const base = at;
		const list = Array(listDataLength);
		for (let i = 0; i < listDataLength; ++i) {
			list[i] = decode(at, to);
			at += _offset;
		}
		_offset = offset + (at - base);
		return list;
	}
	function decodeUtf8String(at, to) {
		const length = decodeCount$1(at, to);
		const offset = _offset;
		at += offset;
		if (to - at < length) overflow$1(length);
		_offset = offset + length;
		if (length < 24) return decodeUtf8StringCached(at, length);
		if (isBuffer$1) return payload$1.toString("utf-8", at, at + length);
		return textDecoder$1.decode(payload$1.subarray(at, at + length));
	}
	var stringCache$1 = new Array(2048);
	var stringCacheEpochs$1 = /* @__PURE__ */ new Uint16Array(2048);
	var cacheEpoch$1 = 0;
	function advanceDecodingEpoch() {
		cacheEpoch$1 = cacheEpoch$1 + 1 & 65535;
	}
	function decodeUtf8StringCached(at, length) {
		let h = length;
		for (let i = 0; i < length; ++i) h = h * 31 + payload$1[at + i] | 0;
		const slot = h >>> 0 & 2047;
		const cached = stringCache$1[slot];
		if (cached !== void 0) {
			if (cached.length === length) {
				let match = true;
				for (let i = 0; i < length; ++i) if (cached.charCodeAt(i) !== payload$1[at + i]) {
					match = false;
					break;
				}
				if (match) {
					stringCacheEpochs$1[slot] = cacheEpoch$1;
					return cached;
				}
			}
		}
		const result = isBuffer$1 ? payload$1.toString("utf-8", at, at + length) : textDecoder$1.decode(payload$1.subarray(at, at + length));
		if (stringCacheEpochs$1[slot] !== cacheEpoch$1) {
			stringCache$1[slot] = result;
			stringCacheEpochs$1[slot] = cacheEpoch$1;
		}
		return result;
	}
	function decodeUnstructuredByteString(at, to) {
		const length = decodeCount$1(at, to);
		const offset = _offset;
		at += offset;
		if (to - at < length) overflow$1(length);
		const value = payload$1.subarray(at, at + length);
		_offset = offset + length;
		return value;
	}
	function decodeTagValue(at, to, minor, unsignedInt, offset) {
		if (minor === 2 || minor === 3) {
			const length = decodeCount$1(at + offset, to);
			let b = BigInt(0);
			const start = at + offset + _offset;
			for (let i = start; i < start + length; ++i) b = b << BigInt(8) | BigInt(payload$1[i]);
			_offset = offset + _offset + length;
			return minor === 3 ? -b - BigInt(1) : b;
		} else if (minor === 4) {
			const [rawExponent, mantissa] = decode(at + offset, to);
			const absMantissa = BigInt(mantissa < 0 ? -1 : 1) * BigInt(mantissa);
			const mantissaDigits = String(absMantissa);
			const sign = mantissa < 0 ? "-" : "";
			let numericString;
			if (typeof rawExponent === "number" && Math.abs(rawExponent) <= 2 ** 28) {
				const exponent = rawExponent;
				const mantissaStr = "0".repeat(Math.abs(exponent) + 1) + mantissaDigits;
				numericString = exponent === 0 ? mantissaStr : mantissaStr.slice(0, mantissaStr.length + exponent) + "." + mantissaStr.slice(exponent);
				numericString = numericString.replace(/^0+/g, "");
				if (numericString === "") numericString = "0";
				if (numericString[0] === ".") numericString = "0" + numericString;
				numericString = sign + numericString;
			} else {
				const bigExponent = BigInt(rawExponent);
				if (mantissaDigits.length === 1) numericString = sign + mantissaDigits + "e" + String(bigExponent);
				else {
					const adjustedExp = bigExponent + BigInt(mantissaDigits.length - 1);
					numericString = sign + mantissaDigits[0] + "." + mantissaDigits.slice(1) + "e" + String(adjustedExp);
				}
			}
			_offset = offset + _offset;
			return nv(numericString);
		} else {
			const value = decode(at + offset, to);
			_offset = offset + _offset;
			return tag({
				tag: castBigInt$1(unsignedInt),
				value
			});
		}
	}
	function decodeSpecial(at, to) {
		const minor = payload$1[at] & 31;
		switch (minor) {
			case specialTrue:
			case specialFalse:
				_offset = 1;
				return minor === specialTrue;
			case specialNull:
				_offset = 1;
				return null;
			case specialUndefined:
				_offset = 1;
				return null;
			case extendedFloat16:
				if (to - at < 3) throw new Error("incomplete float16 at end of buf.");
				_offset = 3;
				return bytesToFloat16$1(payload$1[at + 1], payload$1[at + 2]);
			case extendedFloat32:
				if (to - at < 5) throw new Error("incomplete float32 at end of buf.");
				_offset = 5;
				return dataView$2.getFloat32(at + 1);
			case extendedFloat64:
				if (to - at < 9) throw new Error("incomplete float64 at end of buf.");
				_offset = 9;
				return dataView$2.getFloat64(at + 1);
			default: unexpectedMinor(minor);
		}
	}
	function decodeCount$1(at, to) {
		const minor = payload$1[at] & 31;
		if (minor < 24) {
			_offset = 1;
			return minor;
		}
		switch (minor) {
			case extendedOneByte:
				if (to - at < 2) overflow$1(1);
				_offset = 2;
				return payload$1[at + 1];
			case extendedFloat16:
				if (to - at < 3) overflow$1(2);
				_offset = 3;
				return dataView$2.getUint16(at + 1);
			case extendedFloat32:
				if (to - at < 5) overflow$1(4);
				_offset = 5;
				return dataView$2.getUint32(at + 1);
			case extendedFloat64:
				if (to - at < 9) overflow$1(8);
				_offset = 9;
				return demote(dataView$2.getBigUint64(at + 1));
			default: unexpectedMinor(minor);
		}
	}
	function decodeMapIndefinite(at, to) {
		at += 1;
		const base = at;
		const map = {};
		for (; at < to;) {
			if (payload$1[at] === 255) {
				_offset = at - base + 2;
				return map;
			}
			const key = decodeUtf8String(at, to);
			at += _offset;
			map[key] = decode(at, to);
			at += _offset;
		}
		throw new Error("expected break marker.");
	}
	function decodeListIndefinite(at, to) {
		at += 1;
		const list = [];
		for (const base = at; at < to;) {
			if (payload$1[at] === 255) {
				_offset = at - base + 2;
				return list;
			}
			list.push(decode(at, to));
			at += _offset;
		}
		throw new Error("expected break marker.");
	}
	function decodeUtf8StringIndefinite(at, to) {
		at += 1;
		const vector = [];
		for (const base = at; at < to;) {
			if (payload$1[at] === 255) {
				const data = alloc(vector.length);
				data.set(vector, 0);
				_offset = at - base + 2;
				if (USE_BUFFER$3) return data.toString("utf-8", 0, data.length);
				return textDecoder$1.decode(data);
			}
			const major = (payload$1[at] & 224) >> 5;
			const minor = payload$1[at] & 31;
			if (major !== majorUtf8String) unexpectedMajorInIndefiniteString(major);
			if (minor === minorIndefinite) throw new Error("nested indefinite string.");
			const bytes = decodeUnstructuredByteString(at, to);
			at += _offset;
			for (let i = 0; i < bytes.length; ++i) vector.push(bytes[i]);
		}
		throw new Error("expected break marker.");
	}
	function decodeUnstructuredByteStringIndefinite(at, to) {
		at += 1;
		const vector = [];
		for (const base = at; at < to;) {
			if (payload$1[at] === 255) {
				const data = alloc(vector.length);
				data.set(vector, 0);
				_offset = at - base + 2;
				return data;
			}
			const major = (payload$1[at] & 224) >> 5;
			const minor = payload$1[at] & 31;
			if (major !== majorUnstructuredByteString) unexpectedMajorInIndefiniteString(major);
			if (minor === minorIndefinite) throw new Error("nested indefinite string.");
			const bytes = decodeUnstructuredByteString(at, to);
			at += _offset;
			for (let i = 0; i < bytes.length; ++i) vector.push(bytes[i]);
		}
		throw new Error("expected break marker.");
	}
	function castBigInt$1(bigInt) {
		if (typeof bigInt === "number") return bigInt;
		const num = Number(bigInt);
		if (Number.MIN_SAFE_INTEGER <= num && num <= Number.MAX_SAFE_INTEGER) return num;
		return bigInt;
	}
	function demote(bigInteger) {
		const num = Number(bigInteger);
		if (num < Number.MIN_SAFE_INTEGER || Number.MAX_SAFE_INTEGER < num) console.warn(/* @__PURE__ */ new Error(`@smithy/core/cbor - truncating BigInt(${bigInteger}) to ${num} with loss of precision.`));
		return num;
	}
	function overflow$1(n) {
		throw new Error(`length ${n} greater than remaining buf len.`);
	}
	function unexpectedMinor(minor) {
		throw new Error(`unexpected minor value ${minor}.`);
	}
	function unexpectedMajorInIndefiniteString(major) {
		throw new Error(`unexpected major type ${major} in indefinite string.`);
	}
	var USE_BUFFER$2 = typeof Buffer !== "undefined";
	var encodeStringCache = /* @__PURE__ */ new Map();
	var encodeCacheEpoch$1 = 0;
	var encodeCacheSaturated$1 = false;
	var data = alloc(2048);
	var dataView$1 = new DataView(data.buffer, data.byteOffset, data.byteLength);
	var cursor$1 = 0;
	function encode(_input) {
		const encodeStack = [_input];
		while (encodeStack.length) {
			const input = encodeStack.pop();
			if (typeof input === "string") {
				const len = input.length;
				if (USE_BUFFER$2) {
					ensureSpace(len * 3 + 9);
					if (len > 23) {
						encodeHeader$1(majorUtf8String, Buffer.byteLength(input));
						cursor$1 += data.write(input, cursor$1);
					} else encodeStringCached(input);
				} else {
					ensureSpace(len * 3 + 9);
					const headerPos = cursor$1;
					const byteLen = new TextEncoder().encodeInto(input, data.subarray(cursor$1 + 9)).written;
					let headerSize;
					if (byteLen < 24) headerSize = 1;
					else if (byteLen < 256) headerSize = 2;
					else if (byteLen < 65536) headerSize = 3;
					else if (byteLen < 4294967296) headerSize = 5;
					else headerSize = 9;
					if (headerSize < 9) data.copyWithin(headerPos + headerSize, headerPos + 9, headerPos + 9 + byteLen);
					cursor$1 = headerPos;
					encodeInteger(majorUtf8String, byteLen);
					cursor$1 += byteLen;
				}
				continue;
			}
			if (data.byteLength - cursor$1 < 9) ensureSpace(64);
			if (typeof input === "number") {
				if (Number.isInteger(input) && input >= -9007199254740992 && input <= 9007199254740991) {
					const nonNegative = input >= 0;
					const major = nonNegative ? majorUint64 : majorNegativeInt64;
					const value = nonNegative ? input : -input - 1;
					if (value < 24) data[cursor$1++] = major << 5 | value;
					else if (value < 256) {
						data[cursor$1++] = major << 5 | 24;
						data[cursor$1++] = value;
					} else if (value < 65536) {
						data[cursor$1++] = major << 5 | extendedFloat16;
						data[cursor$1++] = value >> 8;
						data[cursor$1++] = value & 255;
					} else if (value < 4294967296) {
						data[cursor$1++] = major << 5 | extendedFloat32;
						dataView$1.setUint32(cursor$1, value);
						cursor$1 += 4;
					} else {
						data[cursor$1++] = major << 5 | extendedFloat64;
						const hi = value / 4294967296 | 0;
						const lo = value - hi * 4294967296 | 0;
						dataView$1.setUint32(cursor$1, hi);
						dataView$1.setUint32(cursor$1 + 4, lo);
						cursor$1 += 8;
					}
					continue;
				}
				data[cursor$1++] = 251;
				dataView$1.setFloat64(cursor$1, input);
				cursor$1 += 8;
				continue;
			} else if (typeof input === "bigint") {
				const nonNegative = input >= 0;
				const major = nonNegative ? majorUint64 : majorNegativeInt64;
				const value = nonNegative ? input : -input - BigInt(1);
				if (value < BigInt("18446744073709551616")) {
					const n = Number(value);
					if (n < 4294967296) encodeInteger(major, n);
					else {
						data[cursor$1++] = major << 5 | extendedFloat64;
						dataView$1.setBigUint64(cursor$1, value);
						cursor$1 += 8;
					}
				} else {
					const binaryBigInt = value.toString(2);
					const bigIntBytes = new Uint8Array(Math.ceil(binaryBigInt.length / 8));
					let b = value;
					let i = 0;
					while (bigIntBytes.byteLength - ++i >= 0) {
						bigIntBytes[bigIntBytes.byteLength - i] = Number(b & BigInt(255));
						b >>= BigInt(8);
					}
					ensureSpace(bigIntBytes.byteLength * 2 + 16);
					data[cursor$1++] = nonNegative ? 194 : 195;
					encodeHeader$1(majorUnstructuredByteString, bigIntBytes.byteLength);
					data.set(bigIntBytes, cursor$1);
					cursor$1 += bigIntBytes.byteLength;
				}
				continue;
			} else if (input === null) {
				data[cursor$1++] = 246;
				continue;
			} else if (typeof input === "boolean") {
				data[cursor$1++] = 224 | (input ? specialTrue : specialFalse);
				continue;
			} else if (typeof input === "undefined") throw new Error("@smithy/core/cbor: client may not serialize undefined value.");
			else if (Array.isArray(input)) {
				encodeInteger(majorList, input.length);
				ensureSpace(input.length * 9 + 64);
				for (let i = input.length - 1; i >= 0; --i) encodeStack.push(input[i]);
				continue;
			} else if (typeof input.byteLength === "number") {
				ensureSpace(input.length * 2 + 9);
				encodeInteger(majorUnstructuredByteString, input.length);
				data.set(input, cursor$1);
				cursor$1 += input.byteLength;
				continue;
			} else if (typeof input === "object") {
				if (input instanceof NumericValue) {
					let str = input.string;
					let expOffset = BigInt(0);
					const eIndex = str.search(/[eE]/);
					if (eIndex !== -1) {
						expOffset = BigInt(str.slice(eIndex + 1));
						str = str.slice(0, eIndex);
					}
					const decimalIndex = str.indexOf(".");
					const fractionDigits = decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
					const exponent = expOffset - BigInt(fractionDigits);
					const mantissa = BigInt(str.replace(".", ""));
					data[cursor$1++] = 196;
					encodeInteger(majorList, 2);
					encodeStack.push(mantissa);
					encodeStack.push(exponent >= -9007199254740992n && exponent <= 9007199254740991n ? Number(exponent) : exponent);
					continue;
				}
				if (input[tagSymbol]) {
					if ("tag" in input && "value" in input) {
						encodeStack.push(input.value);
						encodeHeader$1(majorTag, input.tag);
						continue;
					} else throw new Error("tag encountered with missing fields, need 'tag' and 'value', found: " + JSON.stringify(input));
				}
				const keys = Object.keys(input);
				const len = keys.length;
				encodeInteger(majorMap, len);
				for (let i = len - 1; i >= 0; --i) {
					encodeStack.push(input[keys[i]]);
					encodeStack.push(keys[i]);
				}
				continue;
			}
			throw new Error(`data type ${input?.constructor?.name ?? typeof input} not compatible for encoding.`);
		}
	}
	function advanceEncodingEpoch() {
		encodeCacheEpoch$1 = encodeCacheEpoch$1 + 1 & 65535;
		encodeCacheSaturated$1 = false;
	}
	function toUint8Array() {
		const out = alloc(cursor$1);
		out.set(data.subarray(0, cursor$1), 0);
		cursor$1 = 0;
		return out;
	}
	function resize(size) {
		const old = data;
		data = alloc(size);
		if (old) {
			if (old.copy) old.copy(data, 0, 0, old.byteLength);
			else data.set(old, 0);
		}
		dataView$1 = new DataView(data.buffer, data.byteOffset, data.byteLength);
	}
	function encodeStringCached(input) {
		const cached = encodeStringCache.get(input);
		if (cached !== void 0) {
			data.set(cached.bytes, cursor$1);
			cursor$1 += cached.bytes.length;
			cached.epoch = encodeCacheEpoch$1;
			return;
		}
		const start = cursor$1;
		encodeInteger(majorUtf8String, Buffer.byteLength(input));
		cursor$1 += data.write(input, cursor$1);
		const bytes = Uint8Array.prototype.slice.call(data, start, cursor$1);
		if (encodeStringCache.size >= 2048) {
			if (encodeCacheSaturated$1) return;
			let evicted = 0;
			for (const [key, entry] of encodeStringCache) {
				if (evicted >= 1024) break;
				if (entry.epoch !== encodeCacheEpoch$1) {
					encodeStringCache.delete(key);
					evicted++;
				}
			}
			if (evicted === 0) {
				encodeCacheSaturated$1 = true;
				return;
			}
		}
		if (encodeStringCache.size < 2048) encodeStringCache.set(input, {
			epoch: encodeCacheEpoch$1,
			bytes
		});
	}
	function ensureSpace(bytes) {
		if (data.byteLength - cursor$1 < bytes) {
			if (cursor$1 < 16e6) resize(Math.max(data.byteLength * 4, data.byteLength + bytes));
			else resize(data.byteLength + bytes + 16e6);
		}
	}
	function encodeHeader$1(major, value) {
		if (value < 24) data[cursor$1++] = major << 5 | value;
		else if (value < 256) {
			data[cursor$1++] = major << 5 | 24;
			data[cursor$1++] = value;
		} else if (value < 65536) {
			data[cursor$1++] = major << 5 | extendedFloat16;
			dataView$1.setUint16(cursor$1, value);
			cursor$1 += 2;
		} else if (value < 4294967296) {
			data[cursor$1++] = major << 5 | extendedFloat32;
			dataView$1.setUint32(cursor$1, value);
			cursor$1 += 4;
		} else {
			data[cursor$1++] = major << 5 | extendedFloat64;
			dataView$1.setBigUint64(cursor$1, typeof value === "bigint" ? value : BigInt(value));
			cursor$1 += 8;
		}
	}
	function encodeInteger(major, value) {
		if (value < 24) data[cursor$1++] = major << 5 | value;
		else if (value < 256) {
			data[cursor$1++] = major << 5 | 24;
			data[cursor$1++] = value;
		} else if (value < 65536) {
			data[cursor$1++] = major << 5 | extendedFloat16;
			data[cursor$1++] = value >> 8;
			data[cursor$1++] = value & 255;
		} else if (value < 4294967296) {
			data[cursor$1++] = major << 5 | extendedFloat32;
			dataView$1.setUint32(cursor$1, value);
			cursor$1 += 4;
		} else {
			data[cursor$1++] = major << 5 | extendedFloat64;
			const hi = value / 4294967296 | 0;
			const lo = value - hi * 4294967296 | 0;
			dataView$1.setUint32(cursor$1, hi);
			dataView$1.setUint32(cursor$1 + 4, lo);
			cursor$1 += 8;
		}
	}
	var cbor = {
		deserialize(payload) {
			advanceDecodingEpoch();
			setPayload(payload);
			return decode(0, payload.length);
		},
		serialize(input) {
			advanceEncodingEpoch();
			try {
				encode(input);
				return toUint8Array();
			} catch (e) {
				toUint8Array();
				throw e;
			}
		},
		resizeEncodingBuffer(size) {
			resize(size);
		}
	};
	var parseCborBody = (streamBody, context) => {
		return collectBody(streamBody, context).then(async (bytes) => {
			if (bytes.length) try {
				return cbor.deserialize(bytes);
			} catch (e) {
				Object.defineProperty(e, "$responseBodyText", { value: context.utf8Encoder(bytes) });
				throw e;
			}
			return {};
		});
	};
	var dateToTag = (date) => {
		return tag({
			tag: 1,
			value: date.getTime() / 1e3
		});
	};
	var parseCborErrorBody = async (errorBody, context) => {
		const value = await parseCborBody(errorBody, context);
		value.message = value.message ?? value.Message;
		return value;
	};
	var loadSmithyRpcV2CborErrorCode = (output, data) => {
		const sanitizeErrorCode = (rawValue) => {
			let cleanValue = rawValue;
			if (typeof cleanValue === "number") cleanValue = cleanValue.toString();
			if (cleanValue.indexOf(",") >= 0) cleanValue = cleanValue.split(",")[0];
			if (cleanValue.indexOf(":") >= 0) cleanValue = cleanValue.split(":")[0];
			return cleanValue;
		};
		if (data["__type"] !== void 0) return sanitizeErrorCode(data["__type"]);
	};
	var checkCborResponse = (response) => {
		if (String(response.headers["smithy-protocol"]).toLowerCase() !== "rpc-v2-cbor") throw new Error("Malformed RPCv2 CBOR response, status: " + response.statusCode);
	};
	var buildHttpRpcRequest = async (context, headers, path, resolvedHostname, body) => {
		const endpoint = await context.endpoint();
		const { hostname, protocol = "https", port, path: basePath } = endpoint;
		const contents = {
			protocol,
			hostname,
			port,
			method: "POST",
			path: basePath.endsWith("/") ? basePath.slice(0, -1) + path : basePath + path,
			headers: { ...headers }
		};
		if (resolvedHostname !== void 0) contents.hostname = resolvedHostname;
		if (endpoint.headers) for (const name in endpoint.headers) {
			if (!hasOwn(endpoint.headers, name)) continue;
			contents.headers[name] = endpoint.headers[name];
		}
		if (body !== void 0) {
			contents.body = body;
			try {
				contents.headers["content-length"] = String(calculateBodyLength(body));
			} catch (ignored) {}
		}
		return new HttpRequest(contents);
	};
	var CborShapeSerializer2 = class extends SerdeContext {
		write(schema, value) {
			cursor = 0;
			writeValue(NormalizedSchema.of(schema), value, void 0, this.serdeContext);
		}
		flush() {
			const result = buf.subarray(0, cursor);
			cursor = 0;
			buf = allocUnsafe(INITIAL_BUFFER_SIZE);
			view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
			return result;
		}
	};
	var CBOR_STRUCT_CACHE = Symbol.for("@smithy/cbor-struct-cache");
	function loadCborStructIterator(ns) {
		const schema = ns.getSchema();
		const existing = schema[CBOR_STRUCT_CACHE];
		if (existing) return existing;
		const memberNames = [];
		const memberSchemas = [];
		for (const [name, memberSchema] of ns.structIterator()) {
			memberNames.push(name);
			memberSchemas.push(memberSchema);
		}
		const encodedKeys = new Array(memberNames.length);
		for (let i = 0; i < memberNames.length; ++i) encodedKeys[i] = encodeCborStringKey(memberNames[i]);
		const cache = {
			memberNames,
			memberSchemas,
			encodedKeys
		};
		schema[CBOR_STRUCT_CACHE] = cache;
		return cache;
	}
	function encodeCborStringKey(s) {
		let utf8Bytes;
		if (USE_BUFFER$1) utf8Bytes = Buffer.from(s, "utf-8");
		else utf8Bytes = new TextEncoder().encode(s);
		const byteLen = utf8Bytes.length;
		let headerSize;
		if (byteLen < 24) headerSize = 1;
		else if (byteLen < 256) headerSize = 2;
		else headerSize = 3;
		const result = new Uint8Array(headerSize + byteLen);
		if (headerSize === 1) result[0] = 96 | byteLen;
		else if (headerSize === 2) {
			result[0] = 120;
			result[1] = byteLen;
		} else {
			result[0] = 121;
			result[1] = byteLen >> 8;
			result[2] = byteLen & 255;
		}
		result.set(utf8Bytes, headerSize);
		return result;
	}
	var USE_BUFFER$1 = typeof Buffer !== "undefined";
	var textEncoder = new TextEncoder();
	var INITIAL_BUFFER_SIZE = 2048;
	var buf = USE_BUFFER$1 ? Buffer.allocUnsafe(INITIAL_BUFFER_SIZE) : new Uint8Array(INITIAL_BUFFER_SIZE);
	var view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
	var cursor = 0;
	var STRING_CACHE_MAX = 2048;
	var stringEncodeCache = /* @__PURE__ */ new Map();
	var encodeCacheEpoch = 0;
	var encodeCacheSaturated = false;
	function allocUnsafe(size) {
		return USE_BUFFER$1 ? Buffer.allocUnsafe(size) : new Uint8Array(size);
	}
	function writeValue(ns, value, container, serdeContext) {
		if (value == null) {
			if (value === void 0 && ns.isIdempotencyToken()) {
				writeString(generateIdempotencyToken());
				return;
			}
			ensure(1);
			buf[cursor++] = 246;
			return;
		}
		if (ns.isUnitSchema()) {
			ensure(1);
			encodeHeader(majorMap, 0);
			return;
		}
		if (typeof value === "object") {
			if (ns.isBlobSchema()) {
				if (value instanceof Uint8Array) {
					writeBytes(value);
					return;
				}
			}
			if (ns.isTimestampSchema()) {
				if (value instanceof Date) {
					writeTimestamp(value);
					return;
				}
			}
			if (ns.isStructSchema()) {
				writeStruct(ns, value, serdeContext);
				return;
			}
			if (Array.isArray(value) && (ns.isListSchema() || ns.isDocumentSchema())) {
				writeList(ns, value, ns.isDocumentSchema(), serdeContext);
				return;
			}
			if (ns.isMapSchema()) {
				writeMap(ns, value, false, serdeContext);
				return;
			}
			if (value instanceof Date) {
				writeTimestamp(value);
				return;
			}
			if (value instanceof Uint8Array) {
				writeBytes(value);
				return;
			}
			if (value instanceof NumericValue) {
				writeNumericValue(value);
				return;
			}
			if (value[tagSymbol]) {
				const tagged = value;
				writeTag(tagged.tag, tagged.value);
				return;
			}
			if (ns.isDocumentSchema()) {
				if (Array.isArray(value)) writeList(ns, value, true, serdeContext);
				else writeMap(ns, value, true, serdeContext);
				return;
			}
			if (ns.isBigDecimalSchema()) {
				writeUntypedValue(value);
				return;
			}
			writeMap(ns, value, true, serdeContext);
			return;
		}
		if (typeof value === "string") {
			if (ns.isBlobSchema()) {
				writeBytes((serdeContext?.base64Decoder ?? fromBase64)(value));
				return;
			}
			writeString(value);
			return;
		}
		if (typeof value === "number") {
			ensure(9);
			if (Number.isInteger(value) && value >= -9007199254740992 && value <= 9007199254740991) writeInteger(value);
			else writeFloat64(value);
			return;
		}
		if (typeof value === "boolean") {
			ensure(1);
			buf[cursor++] = 224 | (value ? specialTrue : specialFalse);
			return;
		}
		if (typeof value === "bigint") {
			writeBigInt(value);
			return;
		}
		writeString(String(value));
	}
	function writeStruct(ns, value, serdeContext) {
		if (ns.isUnionSchema()) {
			let wrote = false;
			for (const [memberName, memberSchema] of ns.structIterator()) {
				const item = value[memberName];
				if (item != null) {
					ensure(9);
					encodeHeader(majorMap, 1);
					writeString(memberName);
					writeValue(memberSchema, item, ns, serdeContext);
					wrote = true;
					break;
				}
			}
			if (!wrote) {
				const { $unknown } = value;
				if (Array.isArray($unknown)) {
					ensure(9);
					encodeHeader(majorMap, 1);
					writeString($unknown[0]);
					writeUntypedValue($unknown[1]);
				} else {
					ensure(9);
					encodeHeader(majorMap, 0);
				}
			}
			return;
		}
		const { memberNames, memberSchemas, encodedKeys } = loadCborStructIterator(ns);
		const z = memberNames.length;
		let headerSize;
		if (z < 24) headerSize = 1;
		else if (z < 256) headerSize = 2;
		else headerSize = 3;
		ensure(headerSize);
		const headerPos = cursor;
		cursor += headerSize;
		let count = 0;
		for (let i = 0; i < z; ++i) {
			const item = value[memberNames[i]];
			if (item == null && !memberSchemas[i].isIdempotencyToken()) continue;
			const key = encodedKeys[i];
			ensure(key.length);
			buf.set(key, cursor);
			cursor += key.length;
			writeValue(memberSchemas[i], item, ns, serdeContext);
			++count;
		}
		if (typeof value.__type === "string") for (const k in value) {
			if (!hasOwn(value, k)) continue;
			if (!memberNames.includes(k)) {
				writeString(k);
				writeUntypedValue(value[k]);
				++count;
			}
		}
		if (headerSize === 1) buf[headerPos] = 160 | count;
		else if (headerSize === 2) {
			buf[headerPos] = 184;
			buf[headerPos + 1] = count;
		} else {
			buf[headerPos] = 185;
			buf[headerPos + 1] = count >> 8;
			buf[headerPos + 2] = count & 255;
		}
	}
	function writeList(ns, value, isDocument, serdeContext) {
		const sparse = !!ns.getMergedTraits().sparse;
		const valueSchema = ns.getValueSchema();
		if (isDocument || sparse) {
			const items = [];
			for (let i = 0; i < value.length; ++i) {
				const item = value[i];
				if (isDocument) {
					if (item !== void 0) items.push(item);
				} else if (item != null || sparse) items.push(item);
			}
			ensure(9);
			encodeHeader(majorList, items.length);
			for (let i = 0; i < items.length; ++i) writeValue(valueSchema, items[i], void 0, serdeContext);
		} else {
			let count = 0;
			for (let i = 0; i < value.length; ++i) if (value[i] != null) ++count;
			ensure(9);
			encodeHeader(majorList, count);
			for (let i = 0; i < value.length; ++i) if (value[i] != null) writeValue(valueSchema, value[i], void 0, serdeContext);
		}
	}
	function writeMap(ns, value, isDocument, serdeContext) {
		const sparse = !!ns.getMergedTraits().sparse;
		const valueSchema = ns.getValueSchema();
		const keys = [];
		for (const k in value) {
			if (!hasOwn(value, k)) continue;
			const v = value[k];
			if (isDocument ? v !== void 0 : v != null || sparse) keys.push(k);
		}
		ensure(9);
		encodeHeader(majorMap, keys.length);
		for (let i = 0; i < keys.length; ++i) {
			const k = keys[i];
			writeString(k);
			writeValue(valueSchema, value[k], void 0, serdeContext);
		}
	}
	function writeUntypedValue(value) {
		if (value == null) {
			ensure(1);
			buf[cursor++] = 246;
			return;
		}
		if (typeof value === "string") {
			writeString(value);
			return;
		}
		if (typeof value === "number") {
			ensure(9);
			if (Number.isInteger(value) && value >= -9007199254740992 && value <= 9007199254740991) writeInteger(value);
			else writeFloat64(value);
			return;
		}
		if (typeof value === "boolean") {
			ensure(1);
			buf[cursor++] = 224 | (value ? specialTrue : specialFalse);
			return;
		}
		if (typeof value === "bigint") {
			writeBigInt(value);
			return;
		}
		if (value instanceof Uint8Array) {
			writeBytes(value);
			return;
		}
		if (value instanceof Date) {
			writeTimestamp(value);
			return;
		}
		if (value instanceof NumericValue) {
			writeNumericValue(value);
			return;
		}
		if (value[tagSymbol]) {
			const tagged = value;
			writeTag(tagged.tag, tagged.value);
			return;
		}
		if (Array.isArray(value)) {
			ensure(9);
			encodeHeader(majorList, value.length);
			for (let i = 0; i < value.length; ++i) writeUntypedValue(value[i]);
			return;
		}
		if (typeof value === "object") {
			const keys = Object.keys(value);
			ensure(9);
			encodeHeader(majorMap, keys.length);
			for (let i = 0; i < keys.length; ++i) {
				writeString(keys[i]);
				writeUntypedValue(value[keys[i]]);
			}
			return;
		}
		writeString(String(value));
	}
	function ensure(n) {
		if (cursor + n > buf.length) {
			let newSize = buf.length * 2;
			while (newSize < cursor + n) newSize *= 2;
			const next = allocUnsafe(newSize);
			next.set(buf.subarray(0, cursor));
			buf = next;
			view = new DataView(next.buffer, next.byteOffset, next.byteLength);
		}
	}
	function encodeHeader(major, value) {
		if (value < 24) buf[cursor++] = major << 5 | value;
		else if (value < 256) {
			buf[cursor++] = major << 5 | 24;
			buf[cursor++] = value;
		} else if (value < 65536) {
			buf[cursor++] = major << 5 | extendedFloat16;
			buf[cursor++] = value >> 8;
			buf[cursor++] = value & 255;
		} else if (value < 4294967296) {
			buf[cursor++] = major << 5 | extendedFloat32;
			view.setUint32(cursor, value);
			cursor += 4;
		} else {
			buf[cursor++] = major << 5 | extendedFloat64;
			const hi = value / 4294967296 | 0;
			const lo = value - hi * 4294967296 | 0;
			view.setUint32(cursor, hi);
			view.setUint32(cursor + 4, lo);
			cursor += 8;
		}
	}
	function encodeBigHeader(major, value) {
		const n = Number(value);
		if (n < 4294967296) {
			encodeHeader(major, n);
			return;
		}
		buf[cursor++] = major << 5 | extendedFloat64;
		view.setBigUint64(cursor, value);
		cursor += 8;
	}
	function writeString(s) {
		const len = s.length;
		if (len <= 23) {
			const cached = stringEncodeCache.get(s);
			if (cached) {
				ensure(cached.bytes.length);
				buf.set(cached.bytes, cursor);
				cursor += cached.bytes.length;
				cached.epoch = encodeCacheEpoch;
				return;
			}
			const start = cursor;
			writeStringUncached(s, len);
			const end = cursor;
			const bytes = Uint8Array.prototype.slice.call(buf, start, end);
			if (stringEncodeCache.size >= STRING_CACHE_MAX) {
				if (encodeCacheSaturated) return;
				let evicted = 0;
				for (const [key, entry] of stringEncodeCache) {
					if (evicted >= 1024) break;
					if (entry.epoch !== encodeCacheEpoch) {
						stringEncodeCache.delete(key);
						++evicted;
					}
				}
				if (evicted === 0) {
					encodeCacheSaturated = true;
					return;
				}
			}
			if (stringEncodeCache.size < STRING_CACHE_MAX) stringEncodeCache.set(s, {
				epoch: encodeCacheEpoch,
				bytes
			});
			return;
		}
		writeStringUncached(s, len);
	}
	function writeStringUncached(s, len) {
		if (USE_BUFFER$1) {
			ensure(len * 3 + 9);
			encodeHeader(majorUtf8String, Buffer.byteLength(s));
			cursor += buf.write(s, cursor);
		} else {
			ensure(len * 3 + 9);
			const headerPos = cursor;
			const byteLen = textEncoder.encodeInto(s, buf.subarray(headerPos + 9)).written;
			let headerSize;
			if (byteLen < 24) headerSize = 1;
			else if (byteLen < 256) headerSize = 2;
			else if (byteLen < 65536) headerSize = 3;
			else if (byteLen < 4294967296) headerSize = 5;
			else headerSize = 9;
			if (headerSize < 9) buf.copyWithin(headerPos + headerSize, headerPos + 9, headerPos + 9 + byteLen);
			cursor = headerPos;
			encodeHeader(majorUtf8String, byteLen);
			cursor += byteLen;
		}
	}
	function writeFloat64(value) {
		ensure(9);
		buf[cursor++] = 251;
		view.setFloat64(cursor, value);
		cursor += 8;
	}
	function writeInteger(value) {
		ensure(9);
		const nonNegative = value >= 0;
		encodeHeader(nonNegative ? majorUint64 : majorNegativeInt64, nonNegative ? value : -value - 1);
	}
	function writeBigInt(value) {
		const nonNegative = value >= 0;
		const major = nonNegative ? majorUint64 : majorNegativeInt64;
		const abs = nonNegative ? value : -value - BigInt(1);
		if (abs < BigInt("18446744073709551616")) {
			ensure(9);
			encodeBigHeader(major, abs);
		} else {
			const binaryStr = abs.toString(2);
			const byteLen = Math.ceil(binaryStr.length / 8);
			const bigIntBytes = new Uint8Array(byteLen);
			let b = abs;
			for (let i = byteLen - 1; i >= 0; --i) {
				bigIntBytes[i] = Number(b & BigInt(255));
				b >>= BigInt(8);
			}
			ensure(byteLen + 16);
			buf[cursor++] = nonNegative ? 194 : 195;
			encodeHeader(majorUnstructuredByteString, byteLen);
			buf.set(bigIntBytes, cursor);
			cursor += byteLen;
		}
	}
	function writeBytes(data) {
		ensure(data.length + 9);
		encodeHeader(majorUnstructuredByteString, data.length);
		buf.set(data, cursor);
		cursor += data.length;
	}
	function writeTag(tagValue, innerValue) {
		ensure(9);
		if (typeof tagValue === "bigint") encodeBigHeader(majorTag, tagValue);
		else encodeHeader(majorTag, tagValue);
		writeUntypedValue(innerValue);
	}
	function writeNumericValue(nv) {
		let str = nv.string;
		let expOffset = BigInt(0);
		const eIndex = str.search(/[eE]/);
		if (eIndex !== -1) {
			expOffset = BigInt(str.slice(eIndex + 1));
			str = str.slice(0, eIndex);
		}
		const decimalIndex = str.indexOf(".");
		const fractionDigits = decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
		const exponent = expOffset - BigInt(fractionDigits);
		const mantissa = BigInt(str.replace(".", ""));
		ensure(9);
		buf[cursor++] = 196;
		encodeHeader(majorList, 2);
		ensure(9);
		if (exponent >= -9007199254740992n && exponent <= 9007199254740991n) writeInteger(Number(exponent));
		else writeBigInt(exponent);
		writeBigInt(mantissa);
	}
	function writeTimestamp(date) {
		ensure(18);
		encodeHeader(majorTag, 1);
		const epochSecs = date.getTime() / 1e3;
		if (Number.isInteger(epochSecs)) writeInteger(epochSecs);
		else writeFloat64(epochSecs);
	}
	var CborShapeDeserializer2 = class extends SerdeContext {
		read(schema, bytes) {
			payload = bytes;
			isBuffer = USE_BUFFER && bytes instanceof Buffer;
			dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
			pos = 0;
			end = bytes.length;
			cacheEpoch = cacheEpoch + 1 & 65535;
			return readValue(NormalizedSchema.of(schema));
		}
		readValue(_schema, value) {
			return transformObject(NormalizedSchema.of(_schema), value);
		}
	};
	var USE_BUFFER = typeof Buffer !== "undefined";
	var textDecoder = new TextDecoder();
	var payload = /* @__PURE__ */ new Uint8Array(0);
	var isBuffer = false;
	var dataView = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(0));
	var pos = 0;
	var end = 0;
	var STRING_CACHE_SIZE = 2048;
	var stringCache = new Array(STRING_CACHE_SIZE);
	var stringCacheEpochs = new Uint16Array(STRING_CACHE_SIZE);
	var cacheEpoch = 0;
	function readValue(ns) {
		if (pos >= end) throw new Error("unexpected end of CBOR payload.");
		const major = (payload[pos] & 224) >> 5;
		if ((payload[pos] & 31) === minorIndefinite && major >= 2 && major <= 5) return readIndefinite(ns, major);
		switch (major) {
			case majorUint64: return readUnsignedInt();
			case majorNegativeInt64: return readNegativeInt();
			case majorUnstructuredByteString: return readByteString();
			case majorUtf8String: return readUtf8String();
			case majorList: return readList(ns);
			case majorMap: return readMap(ns);
			case majorTag: return readTag();
			case majorSpecial: return readSpecial();
			default: throw new Error(`unexpected CBOR major type ${major}.`);
		}
	}
	function readList(ns) {
		const count = decodeCount();
		const memberSchema = ns.isListSchema() ? ns.getValueSchema() : ns;
		const list = Array(count);
		for (let i = 0; i < count; ++i) list[i] = readValue(memberSchema);
		return list;
	}
	function readMap(ns) {
		const count = decodeCount();
		if (ns.isStructSchema()) return readStruct(ns, count, pos);
		const valueSchema = ns.isMapSchema() ? ns.getValueSchema() : ns;
		const map = {};
		for (let i = 0; i < count; ++i) {
			const key = readUtf8String();
			map[key] = readValue(valueSchema);
		}
		return map;
	}
	function readStruct(ns, count, startPos) {
		const isUnion = ns.isUnionSchema();
		const { memberSchemas, encodedKeys, memberNames } = loadCborStructIterator(ns);
		const z = encodedKeys.length;
		const result = {};
		let unknownKey;
		let unknownValue;
		let unknownCount = 0;
		let hasType = false;
		let hint = 0;
		for (let i = 0; i < count; ++i) {
			const matchIdx = matchStructKey(encodedKeys, z, hint);
			if (matchIdx >= 0) {
				hint = matchIdx + 1;
				if (hint >= z) hint = 0;
				const val = readValue(memberSchemas[matchIdx]);
				if (val != null) result[memberNames[matchIdx]] = val;
			} else {
				const key = readUtf8String();
				const val = readValue(NormalizedSchema.of(15));
				if (key === "__type" && typeof val === "string") hasType = true;
				else {
					unknownKey = key;
					unknownValue = val;
					++unknownCount;
				}
			}
		}
		if (isUnion) {
			let resultEmpty = true;
			for (const _ in result) {
				if (!hasOwn(result, _)) continue;
				resultEmpty = false;
				break;
			}
			if (resultEmpty && unknownCount === 1) result.$unknown = [unknownKey, unknownValue];
		} else if (hasType) {
			pos = startPos;
			const docSchema = NormalizedSchema.of(15);
			for (let i = 0; i < count; ++i) {
				const key = readUtf8String();
				const val = readValue(docSchema);
				if (!(key in result)) result[key] = val;
			}
		}
		return result;
	}
	function readTag(ns) {
		const tagNum = decodeArgument();
		const tagNumber = typeof tagNum === "bigint" ? Number(tagNum) : tagNum;
		if (tagNumber === 1) return _parseEpochTimestamp(readValue(NormalizedSchema.of(15)));
		if (tagNumber === 2 || tagNumber === 3) {
			const byteStr = readByteString();
			let b = BigInt(0);
			for (let i = 0; i < byteStr.length; ++i) b = b << BigInt(8) | BigInt(byteStr[i]);
			return tagNumber === 3 ? -b - BigInt(1) : b;
		}
		if (tagNumber === 4) {
			const [rawExponent, mantissa] = readValue(NormalizedSchema.of(15));
			const absMantissa = BigInt(mantissa < 0 ? -1 : 1) * BigInt(mantissa);
			const mantissaDigits = String(absMantissa);
			const sign = mantissa < 0 ? "-" : "";
			let numericString;
			if (typeof rawExponent === "number" && Math.abs(rawExponent) <= 2 ** 28) {
				const exponent = rawExponent;
				const mantissaStr = "0".repeat(Math.abs(exponent) + 1) + mantissaDigits;
				numericString = exponent === 0 ? mantissaStr : mantissaStr.slice(0, mantissaStr.length + exponent) + "." + mantissaStr.slice(exponent);
				numericString = numericString.replace(/^0+/g, "");
				if (numericString === "") numericString = "0";
				if (numericString[0] === ".") numericString = "0" + numericString;
				numericString = sign + numericString;
			} else {
				const bigExponent = BigInt(rawExponent);
				if (mantissaDigits.length === 1) numericString = sign + mantissaDigits + "e" + String(bigExponent);
				else {
					const adjustedExp = bigExponent + BigInt(mantissaDigits.length - 1);
					numericString = sign + mantissaDigits[0] + "." + mantissaDigits.slice(1) + "e" + String(adjustedExp);
				}
			}
			return nv(numericString);
		}
		const innerValue = readValue(NormalizedSchema.of(15));
		return {
			tag: castBigInt(tagNum),
			value: innerValue
		};
	}
	function readIndefinite(ns, major) {
		switch (major) {
			case majorUtf8String: return readUtf8StringIndefinite();
			case majorUnstructuredByteString: return readByteStringIndefinite();
			case majorList: return readListIndefinite(ns);
			case majorMap: return readMapIndefinite(ns);
			default: throw new Error(`unexpected indefinite length for major ${major}.`);
		}
	}
	function readUtf8StringIndefinite() {
		pos += 1;
		const chunks = [];
		let totalLen = 0;
		while (pos < end) {
			if (payload[pos] === 255) {
				pos += 1;
				const combined = new Uint8Array(totalLen);
				let offset = 0;
				for (let i = 0; i < chunks.length; ++i) {
					combined.set(chunks[i], offset);
					offset += chunks[i].length;
				}
				if (USE_BUFFER) return Buffer.from(combined.buffer, combined.byteOffset, combined.byteLength).toString("utf-8");
				return textDecoder.decode(combined);
			}
			const bytes = readByteString();
			chunks.push(bytes);
			totalLen += bytes.length;
		}
		throw new Error("expected break marker.");
	}
	function readByteStringIndefinite() {
		pos += 1;
		const chunks = [];
		let totalLen = 0;
		while (pos < end) {
			if (payload[pos] === 255) {
				pos += 1;
				const combined = new Uint8Array(totalLen);
				let offset = 0;
				for (let i = 0; i < chunks.length; ++i) {
					combined.set(chunks[i], offset);
					offset += chunks[i].length;
				}
				return combined;
			}
			const bytes = readByteString();
			chunks.push(bytes);
			totalLen += bytes.length;
		}
		throw new Error("expected break marker.");
	}
	function readListIndefinite(ns) {
		pos += 1;
		const memberSchema = ns.isListSchema() ? ns.getValueSchema() : ns;
		const list = [];
		while (pos < end) {
			if (payload[pos] === 255) {
				pos += 1;
				return list;
			}
			list.push(readValue(memberSchema));
		}
		throw new Error("expected break marker.");
	}
	function readMapIndefinite(ns) {
		pos += 1;
		if (ns.isStructSchema()) {
			const { memberSchemas, encodedKeys, memberNames } = loadCborStructIterator(ns);
			const z = encodedKeys.length;
			const isUnion = ns.isUnionSchema();
			const result = {};
			let unknownKey;
			let unknownValue;
			let unknownCount = 0;
			let hint = 0;
			while (pos < end) {
				if (payload[pos] === 255) {
					pos += 1;
					if (isUnion) {
						let resultEmpty = true;
						for (const _ in result) {
							if (!hasOwn(result, _)) continue;
							resultEmpty = false;
							break;
						}
						if (resultEmpty && unknownCount === 1) result.$unknown = [unknownKey, unknownValue];
					}
					return result;
				}
				const matchIdx = matchStructKey(encodedKeys, z, hint);
				if (matchIdx >= 0) {
					hint = matchIdx + 1;
					if (hint >= z) hint = 0;
					const val = readValue(memberSchemas[matchIdx]);
					if (val != null) result[memberNames[matchIdx]] = val;
				} else {
					const key = readUtf8String();
					const val = readValue(NormalizedSchema.of(15));
					if (key !== "__type") {
						unknownKey = key;
						unknownValue = val;
						++unknownCount;
					}
				}
			}
			throw new Error("expected break marker.");
		}
		const valueSchema = ns.isMapSchema() ? ns.getValueSchema() : ns;
		const map = {};
		while (pos < end) {
			if (payload[pos] === 255) {
				pos += 1;
				return map;
			}
			const key = readUtf8String();
			map[key] = readValue(valueSchema);
		}
		throw new Error("expected break marker.");
	}
	function matchStructKey(encodedKeys, z, hint) {
		const hintKey = encodedKeys[hint];
		if (pos + hintKey.length <= end && bytesMatch(pos, hintKey)) {
			pos += hintKey.length;
			return hint;
		}
		for (let i = 0; i < z; ++i) {
			if (i === hint) continue;
			const ek = encodedKeys[i];
			if (pos + ek.length <= end && bytesMatch(pos, ek)) {
				pos += ek.length;
				return i;
			}
		}
		return -1;
	}
	function bytesMatch(at, expected) {
		const len = expected.length;
		if (payload[at] !== expected[0]) return false;
		for (let i = 1; i < len; ++i) if (payload[at + i] !== expected[i]) return false;
		return true;
	}
	function decodeArgument() {
		const minor = payload[pos] & 31;
		if (minor < 24) {
			pos += 1;
			return minor;
		}
		switch (minor) {
			case extendedOneByte:
				if (end - pos < 2) overflow(1);
				pos += 2;
				return payload[pos - 1];
			case extendedFloat16:
				if (end - pos < 3) overflow(2);
				pos += 3;
				return dataView.getUint16(pos - 2);
			case extendedFloat32:
				if (end - pos < 5) overflow(4);
				pos += 5;
				return dataView.getUint32(pos - 4);
			case extendedFloat64: {
				if (end - pos < 9) overflow(8);
				pos += 9;
				const hi = dataView.getUint32(pos - 8);
				if (hi < 2097152) return hi * 4294967296 + dataView.getUint32(pos - 4);
				return dataView.getBigUint64(pos - 8);
			}
			default: throw new Error(`unexpected minor value ${minor}.`);
		}
	}
	function decodeCount() {
		const val = decodeArgument();
		return typeof val === "bigint" ? Number(val) : val;
	}
	function readUnsignedInt() {
		return castBigInt(decodeArgument());
	}
	function readNegativeInt() {
		const val = decodeArgument();
		if (typeof val === "bigint") return BigInt(-1) - val;
		return -1 - val;
	}
	function readByteString() {
		const length = decodeCount();
		if (end - pos < length) overflow(length);
		const start = pos;
		pos += length;
		return payload.subarray(start, start + length);
	}
	function readUtf8String() {
		const length = decodeCount();
		if (end - pos < length) overflow(length);
		const start = pos;
		pos += length;
		if (length < 24) return decodeUtf8Cached(start, length);
		if (isBuffer) return payload.toString("utf-8", start, start + length);
		return textDecoder.decode(payload.subarray(start, start + length));
	}
	function decodeUtf8Cached(at, length) {
		let h = length;
		for (let i = 0; i < length; ++i) h = h * 31 + payload[at + i] | 0;
		const slot = h >>> 0 & 2047;
		const cached = stringCache[slot];
		if (cached !== void 0 && cached.length === length) {
			let match = true;
			for (let i = 0; i < length; ++i) if (cached.charCodeAt(i) !== payload[at + i]) {
				match = false;
				break;
			}
			if (match) {
				stringCacheEpochs[slot] = cacheEpoch;
				return cached;
			}
		}
		const result = isBuffer ? payload.toString("utf-8", at, at + length) : textDecoder.decode(payload.subarray(at, at + length));
		if (stringCacheEpochs[slot] !== cacheEpoch) {
			stringCache[slot] = result;
			stringCacheEpochs[slot] = cacheEpoch;
		}
		return result;
	}
	function readSpecial() {
		const p = pos;
		const minor = payload[p] & 31;
		switch (minor) {
			case specialTrue:
				pos = p + 1;
				return true;
			case specialFalse:
				pos = p + 1;
				return false;
			case specialNull:
				pos = p + 1;
				return null;
			case specialUndefined:
				pos = p + 1;
				return null;
			case extendedFloat16:
				if (end - p < 3) overflow(2);
				pos = p + 3;
				return bytesToFloat16(payload[p + 1], payload[p + 2]);
			case extendedFloat32:
				if (end - p < 5) overflow(4);
				pos = p + 5;
				return dataView.getFloat32(p + 1);
			case extendedFloat64:
				if (end - p < 9) overflow(8);
				pos = p + 9;
				return dataView.getFloat64(p + 1);
			default: throw new Error(`unexpected minor value ${minor} for major 7.`);
		}
	}
	function bytesToFloat16(a, b) {
		const sign = a >> 7;
		const exponent = (a & 124) >> 2;
		const fraction = (a & 3) << 8 | b;
		const scalar = sign === 0 ? 1 : -1;
		if (exponent === 0) {
			if (fraction === 0) return 0;
			return scalar * (Math.pow(2, -14) * (fraction / 1024));
		} else if (exponent === 31) {
			if (fraction === 0) return scalar * Infinity;
			return NaN;
		}
		return scalar * (Math.pow(2, exponent - 15) * (1 + fraction / 1024));
	}
	function castBigInt(value) {
		if (typeof value === "number") return value;
		const num = Number(value);
		if (Number.MIN_SAFE_INTEGER <= num && num <= Number.MAX_SAFE_INTEGER) return num;
		return value;
	}
	function overflow(n) {
		throw new Error(`CBOR: length ${n} greater than remaining buffer length.`);
	}
	function transformObject(ns, value) {
		if (ns.isTimestampSchema()) {
			if (typeof value === "number") return _parseEpochTimestamp(value);
			if (typeof value === "object" && value !== null) {
				if (value.tag === 1 && "value" in value) return _parseEpochTimestamp(value.value);
			}
		}
		if (ns.isBlobSchema()) return value;
		if (typeof value === "undefined" || typeof value === "boolean" || typeof value === "number" || typeof value === "string" || typeof value === "bigint" || typeof value === "symbol") return value;
		if (typeof value !== "object" || value === null) return value;
		if ("byteLength" in value) return value;
		if (value instanceof Date) return value;
		if (value instanceof NumericValue) return value;
		if (ns.isDocumentSchema()) return value;
		if (ns.isListSchema()) {
			const memberSchema = ns.getValueSchema();
			const out = [];
			for (const item of value) out.push(transformObject(memberSchema, item));
			return out;
		}
		const newObject = {};
		if (ns.isMapSchema()) {
			const targetSchema = ns.getValueSchema();
			for (const key in value) {
				if (!hasOwn(value, key)) continue;
				newObject[key] = transformObject(targetSchema, value[key]);
			}
		} else if (ns.isStructSchema()) {
			const isUnion = ns.isUnionSchema();
			let keys;
			if (isUnion) {
				keys = /* @__PURE__ */ new Set();
				for (const k in value) {
					if (!hasOwn(value, k)) continue;
					if (k !== "__type") keys.add(k);
				}
			}
			for (const [key, memberSchema] of ns.structIterator()) {
				if (isUnion) keys.delete(key);
				if (value[key] != null) newObject[key] = transformObject(memberSchema, value[key]);
			}
			if (isUnion && keys?.size === 1) {
				let newObjectEmpty = true;
				for (const _ in newObject) {
					if (!hasOwn(newObject, _)) continue;
					newObjectEmpty = false;
					break;
				}
				if (newObjectEmpty) {
					const k = keys.values().next().value;
					newObject.$unknown = [k, value[k]];
				}
			} else if (typeof value.__type === "string") for (const k in value) {
				if (!hasOwn(value, k)) continue;
				if (!(k in newObject)) newObject[k] = value[k];
			}
		}
		return newObject;
	}
	var CborCodec = class extends SerdeContext {
		createSerializer() {
			const serializer = new CborShapeSerializer2();
			serializer.setSerdeContext(this.serdeContext);
			return serializer;
		}
		createDeserializer() {
			const deserializer = new CborShapeDeserializer2();
			deserializer.setSerdeContext(this.serdeContext);
			return deserializer;
		}
	};
	var SmithyRpcV2CborProtocol = class extends RpcProtocol {
		codec = new CborCodec();
		serializer = this.codec.createSerializer();
		deserializer = this.codec.createDeserializer();
		constructor({ defaultNamespace, errorTypeRegistries }) {
			super({
				defaultNamespace,
				errorTypeRegistries
			});
		}
		getShapeId() {
			return "smithy.protocols#rpcv2Cbor";
		}
		getPayloadCodec() {
			return this.codec;
		}
		async serializeRequest(operationSchema, input, context) {
			const request = await super.serializeRequest(operationSchema, input, context);
			Object.assign(request.headers, {
				"content-type": this.getDefaultContentType(),
				"smithy-protocol": "rpc-v2-cbor",
				accept: this.getDefaultContentType()
			});
			if (deref(operationSchema.input) === "unit") {
				delete request.body;
				delete request.headers["content-type"];
			} else {
				if (!request.body) {
					this.serializer.write(15, {});
					request.body = this.serializer.flush();
				}
				if (request.body instanceof Uint8Array) request.headers["content-length"] = String(request.body.byteLength);
			}
			const { service, operation } = getSmithyContext(context);
			const path = `/service/${service}/operation/${operation}`;
			if (request.path.endsWith("/")) request.path += path.slice(1);
			else request.path += path;
			return request;
		}
		async deserializeResponse(operationSchema, context, response) {
			return super.deserializeResponse(operationSchema, context, response);
		}
		async handleError(operationSchema, context, response, dataObject, metadata) {
			const errorIdentifier = loadSmithyRpcV2CborErrorCode(response, dataObject) ?? "Unknown";
			const preferredNamespaces = ["*"];
			const { defaultNamespace } = this.options;
			preferredNamespaces.unshift(defaultNamespace);
			const [namespace, errorShapeName] = (() => {
				if (errorIdentifier.includes("#")) return errorIdentifier.split("#");
				return [void 0, errorIdentifier];
			})();
			if (namespace) preferredNamespaces.unshift(namespace);
			const errorMetadata = {
				$metadata: metadata,
				$fault: response.statusCode < 500 ? "client" : "server"
			};
			const preferredRegistries = [this.compositeErrorRegistry];
			if (namespace) preferredRegistries.push(TypeRegistry.for(namespace));
			preferredRegistries.push(TypeRegistry.for(defaultNamespace));
			const [errorSchema, ErrorCtor, errorMode] = this.resolveError(errorShapeName, preferredNamespaces, preferredRegistries);
			if (errorMode === "native" || errorMode === "synthetic") {
				if (dataObject.Message) dataObject.message = dataObject.Message;
				const error = errorMode === "synthetic" ? new ErrorCtor({ name: errorShapeName }) : new Error(errorShapeName);
				throw Object.assign(error, errorMetadata, dataObject);
			}
			const ns = NormalizedSchema.of(errorSchema);
			const message = dataObject.message ?? dataObject.Message ?? "Unknown";
			const exception = new ErrorCtor({});
			const output = {};
			for (const [name, member] of ns.structIterator()) output[name] = this.deserializer.readValue(member, dataObject[name]);
			throw Object.assign(exception, errorMetadata, {
				$fault: ns.getMergedTraits().error,
				message
			}, output);
		}
		getDefaultContentType() {
			return "application/cbor";
		}
	};
	var CborShapeSerializer = class extends SerdeContext {
		value;
		write(schema, value) {
			this.value = this.serialize(schema, value);
		}
		serialize(schema, source) {
			const ns = NormalizedSchema.of(schema);
			if (source == null) {
				if (ns.isIdempotencyToken()) return generateIdempotencyToken();
				return source;
			}
			if (ns.isBlobSchema()) {
				if (typeof source === "string") return (this.serdeContext?.base64Decoder ?? fromBase64)(source);
				return source;
			}
			if (ns.isTimestampSchema()) {
				if (typeof source === "number" || typeof source === "bigint") return dateToTag(/* @__PURE__ */ new Date(Number(source) / 1e3 | 0));
				return dateToTag(source);
			}
			if (typeof source === "function" || typeof source === "object") {
				const sourceObject = source;
				if (ns.isListSchema() && Array.isArray(sourceObject)) {
					const sparse = !!ns.getMergedTraits().sparse;
					const newArray = [];
					let i = 0;
					for (const item of sourceObject) {
						const value = this.serialize(ns.getValueSchema(), item);
						if (value != null || sparse) newArray[i++] = value;
					}
					return newArray;
				}
				if (sourceObject instanceof Date) return dateToTag(sourceObject);
				const newObject = {};
				if (ns.isMapSchema()) {
					const sparse = !!ns.getMergedTraits().sparse;
					for (const key in sourceObject) {
						if (!hasOwn(sourceObject, key)) continue;
						const value = this.serialize(ns.getValueSchema(), sourceObject[key]);
						if (value != null || sparse) newObject[key] = value;
					}
				} else if (ns.isStructSchema()) {
					for (const [key, memberSchema] of ns.structIterator()) {
						const value = this.serialize(memberSchema, sourceObject[key]);
						if (value != null) newObject[key] = value;
					}
					if (ns.isUnionSchema() && Array.isArray(sourceObject.$unknown)) {
						const [k, v] = sourceObject.$unknown;
						newObject[k] = v;
					} else if (typeof sourceObject.__type === "string") for (const k in sourceObject) {
						if (!hasOwn(sourceObject, k)) continue;
						if (!(k in newObject)) newObject[k] = this.serialize(15, sourceObject[k]);
					}
				} else if (ns.isDocumentSchema()) {
					if (Array.isArray(sourceObject)) {
						const newArray = [];
						let i = 0;
						for (const item of sourceObject) newArray[i++] = this.serialize(ns.getValueSchema(), item);
						return newArray;
					}
					for (const key in sourceObject) {
						if (!hasOwn(sourceObject, key)) continue;
						newObject[key] = this.serialize(ns.getValueSchema(), sourceObject[key]);
					}
				} else if (ns.isBigDecimalSchema()) return sourceObject;
				return newObject;
			}
			return source;
		}
		flush() {
			const buffer = cbor.serialize(this.value);
			this.value = void 0;
			return buffer;
		}
	};
	var CborShapeDeserializer = class extends SerdeContext {
		read(schema, bytes) {
			const data = cbor.deserialize(bytes);
			return this.readValue(schema, data);
		}
		readValue(_schema, value) {
			const ns = NormalizedSchema.of(_schema);
			if (ns.isTimestampSchema()) {
				if (typeof value === "number") return _parseEpochTimestamp(value);
				if (typeof value === "object") {
					if (value.tag === 1 && "value" in value) return _parseEpochTimestamp(value.value);
				}
			}
			if (ns.isBlobSchema()) {
				if (typeof value === "string") return (this.serdeContext?.base64Decoder ?? fromBase64)(value);
				return value;
			}
			if (typeof value === "undefined" || typeof value === "boolean" || typeof value === "number" || typeof value === "string" || typeof value === "bigint" || typeof value === "symbol") return value;
			else if (typeof value === "object") {
				if (value === null) return null;
				if ("byteLength" in value) return value;
				if (value instanceof Date) return value;
				if (ns.isDocumentSchema()) return value;
				if (ns.isListSchema()) {
					const newArray = [];
					const memberSchema = ns.getValueSchema();
					for (const item of value) {
						const itemValue = this.readValue(memberSchema, item);
						newArray.push(itemValue);
					}
					return newArray;
				}
				const newObject = {};
				if (ns.isMapSchema()) {
					const targetSchema = ns.getValueSchema();
					for (const key in value) {
						if (!hasOwn(value, key)) continue;
						newObject[key] = this.readValue(targetSchema, value[key]);
					}
				} else if (ns.isStructSchema()) {
					const isUnion = ns.isUnionSchema();
					let keys;
					if (isUnion) {
						keys = /* @__PURE__ */ new Set();
						for (const k in value) {
							if (!hasOwn(value, k)) continue;
							if (k !== "__type") keys.add(k);
						}
					}
					for (const [key, memberSchema] of ns.structIterator()) {
						if (isUnion) keys.delete(key);
						if (value[key] != null) newObject[key] = this.readValue(memberSchema, value[key]);
					}
					if (isUnion && keys?.size === 1) {
						let newObjectEmpty = true;
						for (const _ in newObject) {
							if (!hasOwn(newObject, _)) continue;
							newObjectEmpty = false;
							break;
						}
						if (newObjectEmpty) {
							const k = keys.values().next().value;
							newObject.$unknown = [k, value[k]];
						}
					} else if (typeof value.__type === "string") for (const k in value) {
						if (!hasOwn(value, k)) continue;
						if (!(k in newObject)) newObject[k] = value[k];
					}
				} else if (value instanceof NumericValue) return value;
				return newObject;
			} else return value;
		}
	};
	exports.CborCodec = CborCodec;
	exports.CborShapeDeserializer = CborShapeDeserializer;
	exports.CborShapeDeserializer2 = CborShapeDeserializer2;
	exports.CborShapeSerializer = CborShapeSerializer;
	exports.CborShapeSerializer2 = CborShapeSerializer2;
	exports.SmithyRpcV2CborProtocol = SmithyRpcV2CborProtocol;
	exports.buildHttpRpcRequest = buildHttpRpcRequest;
	exports.cbor = cbor;
	exports.checkCborResponse = checkCborResponse;
	exports.dateToTag = dateToTag;
	exports.loadSmithyRpcV2CborErrorCode = loadSmithyRpcV2CborErrorCode;
	exports.parseCborBody = parseCborBody;
	exports.parseCborErrorBody = parseCborErrorBody;
	exports.tag = tag;
	exports.tagSymbol = tagSymbol;
}));
//#endregion
//#region node_modules/@aws-sdk/xml-builder/dist-es/escape-attribute.js
function escapeAttribute(value) {
	return value.replace(ATTR_ESCAPE_RE, (ch) => ATTR_ESCAPE_MAP[ch]);
}
var ATTR_ESCAPE_RE, ATTR_ESCAPE_MAP;
var init_escape_attribute = __esmMin((() => {
	ATTR_ESCAPE_RE = /[&<>"]/g;
	ATTR_ESCAPE_MAP = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;"
	};
}));
//#endregion
//#region node_modules/@aws-sdk/xml-builder/dist-es/escape-element.js
function escapeElement(value) {
	return value.replace(ELEMENT_ESCAPE_RE, (ch) => ELEMENT_ESCAPE_MAP[ch]);
}
var ELEMENT_ESCAPE_RE, ELEMENT_ESCAPE_MAP;
var init_escape_element = __esmMin((() => {
	ELEMENT_ESCAPE_RE = /[&"'<>\r\n\u0085\u2028]/g;
	ELEMENT_ESCAPE_MAP = {
		"&": "&amp;",
		"\"": "&quot;",
		"'": "&apos;",
		"<": "&lt;",
		">": "&gt;",
		"\r": "&#x0D;",
		"\n": "&#x0A;",
		"": "&#x85;",
		"\u2028": "&#x2028;"
	};
}));
//#endregion
//#region node_modules/@aws-sdk/xml-builder/dist-es/XmlText.js
var XmlText;
var init_XmlText = __esmMin((() => {
	init_escape_element();
	XmlText = class {
		value;
		constructor(value) {
			this.value = value;
		}
		toString() {
			return escapeElement("" + this.value);
		}
	};
}));
//#endregion
//#region node_modules/@aws-sdk/xml-builder/dist-es/XmlNode.js
var XmlNode;
var init_XmlNode = __esmMin((() => {
	init_escape_attribute();
	init_XmlText();
	XmlNode = class XmlNode {
		name;
		children;
		attributes = {};
		static of(name, childText, withName) {
			const node = new XmlNode(name);
			if (childText !== void 0) node.addChildNode(new XmlText(childText));
			if (withName !== void 0) node.withName(withName);
			return node;
		}
		constructor(name, children = []) {
			this.name = name;
			this.children = children;
		}
		withName(name) {
			this.name = name;
			return this;
		}
		addAttribute(name, value) {
			this.attributes[name] = value;
			return this;
		}
		addChildNode(child) {
			this.children.push(child);
			return this;
		}
		removeAttribute(name) {
			delete this.attributes[name];
			return this;
		}
		n(name) {
			this.name = name;
			return this;
		}
		c(child) {
			this.children.push(child);
			return this;
		}
		a(name, value) {
			if (value != null) this.attributes[name] = value;
			return this;
		}
		cc(input, field, withName = field) {
			if (input[field] != null) {
				const node = XmlNode.of(field, input[field]).withName(withName);
				this.c(node);
			}
		}
		l(input, listName, memberName, valueProvider) {
			if (input[listName] != null) valueProvider().map((node) => {
				node.withName(memberName);
				this.c(node);
			});
		}
		lc(input, listName, memberName, valueProvider) {
			if (input[listName] != null) {
				const nodes = valueProvider();
				const containerNode = new XmlNode(memberName);
				nodes.map((node) => {
					containerNode.c(node);
				});
				this.c(containerNode);
			}
		}
		toString() {
			const hasChildren = Boolean(this.children.length);
			let xmlText = `<${this.name}`;
			const attributes = this.attributes;
			for (const attributeName of Object.keys(attributes)) {
				const attribute = attributes[attributeName];
				if (attribute != null) xmlText += ` ${attributeName}="${escapeAttribute("" + attribute)}"`;
			}
			return xmlText += !hasChildren ? "/>" : `>${this.children.map((c) => c.toString()).join("")}</${this.name}>`;
		}
	};
}));
//#endregion
//#region node_modules/@aws-sdk/xml-builder/dist-es/xml-parser.js
function writeKey(obj) {
	Object.defineProperty(obj, "__proto__", {
		value: void 0,
		writable: true,
		enumerable: true,
		configurable: true
	});
}
function parseXML(xml) {
	return new AwsXmlParser(xml).parse();
}
var AwsXmlParser;
var init_xml_parser = __esmMin((() => {
	AwsXmlParser = class AwsXmlParser {
		x;
		i = 0;
		z;
		constructor(x) {
			this.x = x;
			this.x = x.replace(/\r\n?/g, "\n");
			this.z = this.x.length;
		}
		parse() {
			const p = this;
			const { z } = p;
			while (p.i < z) {
				p.trim();
				if (p.i >= z) break;
				if (p.isNext("<?")) {
					p.readTo("?>");
					p.trim();
				} else if (p.isNext("<!--")) {
					p.readTo("-->");
					p.trim();
				} else if (p.isNext("<!DOCTYPE", false)) {
					p.skipDoctype();
					p.trim();
				} else if (p.x[p.i] === "<") {
					const root = p.parseTag();
					return { [root.tag]: root.value };
				} else throw new Error("@aws-sdk XML parse error: unexpected content.");
			}
			throw new Error("@aws-sdk XML parse error: no root element.");
		}
		isNext(s, caseSensitive = true) {
			const p = this;
			if (caseSensitive) return p.x.startsWith(s, p.i);
			return p.x.toLowerCase().startsWith(s.toLowerCase(), p.i);
		}
		readTo(stop) {
			const p = this;
			const _i = p.x.indexOf(stop, p.i);
			if (_i === -1) throw new Error(`@aws-sdk XML parse error: expected "${stop}" not found.`);
			const result = p.x.slice(p.i, _i);
			p.i = _i + stop.length;
			return result;
		}
		trim() {
			const p = this;
			while (p.i < p.z && " 	\r\n".includes(p.x[p.i])) ++p.i;
		}
		readAttrValue() {
			const p = this;
			const quote = p.x[p.i];
			++p.i;
			let value = "";
			while (p.i < p.z && p.x[p.i] !== quote) value += p.x[p.i++];
			++p.i;
			return p.decodeEntities(value);
		}
		parseTag() {
			const p = this;
			++p.i;
			let tag = "";
			while (p.i < p.z && !" 	\r\n>/".includes(p.x[p.i])) tag += p.x[p.i++];
			let hasAttrs = false;
			const attrs = {};
			while (p.i < p.z) {
				p.trim();
				if (">/".includes(p.x[p.i])) break;
				let name = "";
				while (p.i < p.z && !"= 	\r\n>/?".includes(p.x[p.i])) name += p.x[p.i++];
				p.trim();
				if (p.x[p.i] !== "=") break;
				++p.i;
				p.trim();
				if (name === "__proto__") writeKey(attrs);
				attrs[name] = p.readAttrValue();
				hasAttrs = true;
			}
			if (p.i >= p.z) throw new Error("@aws-sdk XML parse error: unexpected end of input.");
			if (p.x[p.i] === "/") {
				++p.i;
				if (p.i >= p.z || p.x[p.i] !== ">") throw new Error("@aws-sdk XML parse error: expected > at the end of self-closing tag.");
				++p.i;
				return {
					tag,
					value: hasAttrs ? attrs : ""
				};
			}
			if (p.x[p.i] !== ">") throw new Error("@aws-sdk XML parse error: expected > at the end of opening tag.");
			++p.i;
			const textParts = [];
			const childTags = [];
			let hasElementChild = false;
			while (p.i < p.z) {
				if (p.isNext("</")) break;
				if (p.x[p.i] === "<") {
					if (p.isNext("<!--")) p.readTo("-->");
					else if (p.isNext("<![CDATA[")) {
						p.i += 9;
						textParts.push(p.readTo("]]>"));
					} else if (p.isNext("<?")) p.readTo("?>");
					else {
						hasElementChild = true;
						childTags.push(p.parseTag());
					}
				} else {
					let text = "";
					while (p.i < p.z && p.x[p.i] !== "<") text += p.x[p.i++];
					textParts.push(p.decodeEntities(text));
				}
			}
			if (!p.isNext("</")) throw new Error(`@aws-sdk XML parse error: missing closing tag </${tag}>.`);
			p.i += 2;
			const closeTag = p.readTo(">").trim();
			if (closeTag !== tag) throw new Error(`@aws-sdk XML parse error: mismatched tags <${tag}> and </${closeTag}>.`);
			if (!hasAttrs && textParts.length === 0 && !hasElementChild) return {
				tag,
				value: ""
			};
			if (!hasAttrs && !hasElementChild) {
				const text = textParts.length === 1 ? textParts[0] : textParts.join("");
				if (text.trim() === "" && text.includes("\n")) return {
					tag,
					value: ""
				};
				return {
					tag,
					value: text
				};
			}
			const obj = {};
			for (const text of textParts) {
				if (text.trim() === "" && text.includes("\n")) continue;
				obj["#text"] = "#text" in obj ? obj["#text"] + text : text;
			}
			for (const child of childTags) {
				if (child.tag === "__proto__") writeKey(obj);
				if (child.tag in obj) {
					if (Array.isArray(obj[child.tag])) obj[child.tag].push(child.value);
					else obj[child.tag] = [obj[child.tag], child.value];
				} else obj[child.tag] = child.value;
			}
			for (const [k, v] of Object.entries(attrs)) {
				if (k === "__proto__") writeKey(obj);
				obj[k] = v;
			}
			return {
				tag,
				value: obj
			};
		}
		static ENTITIES = {
			amp: "&",
			lt: "<",
			gt: ">",
			quot: "\"",
			apos: "'"
		};
		skipDoctype() {
			const p = this;
			p.i += 9;
			let depth = 0;
			while (p.i < p.z) {
				const c = p.x[p.i];
				if (c === "[") ++depth;
				else if (c === "]") --depth;
				else if (c === ">" && depth === 0) {
					++p.i;
					return;
				}
				++p.i;
			}
			throw new Error("@aws-sdk XML parse error: unclosed DOCTYPE.");
		}
		decodeEntities(s) {
			return s.replace(/&(?:#x([0-9a-fA-F]{1,6})|#(\d{1,7})|([a-zA-Z][a-zA-Z0-9]{0,30}));/g, (_, hex, dec, named) => {
				if (hex) return String.fromCharCode(parseInt(hex, 16));
				if (dec) return String.fromCharCode(parseInt(dec, 10));
				return AwsXmlParser.ENTITIES[named] ?? "";
			});
		}
	};
}));
//#endregion
//#region node_modules/@aws-sdk/xml-builder/dist-es/index.js
var dist_es_exports$3 = /* @__PURE__ */ __exportAll({
	XmlNode: () => XmlNode,
	XmlText: () => XmlText,
	parseXML: () => parseXML
});
var init_dist_es$1 = __esmMin((() => {
	init_XmlNode();
	init_XmlText();
	init_xml_parser();
}));
//#endregion
//#region node_modules/@aws-sdk/core/dist-cjs/submodules/protocols/index.js
var require_protocols = /* @__PURE__ */ __commonJSMin(((exports) => {
	var { SmithyRpcV2CborProtocol, loadSmithyRpcV2CborErrorCode } = require_cbor();
	var { TypeRegistry, NormalizedSchema, deref } = require_schema();
	var { decorateServiceException, getValueFromTextNode } = require_client();
	var { collectBody, determineTimestampFormat, RpcProtocol, HttpBindingProtocol, HttpInterceptingShapeSerializer, HttpInterceptingShapeDeserializer, FromStringShapeDeserializer, extendedEncodeURIComponent } = require_protocols$1();
	var { NumericValue, toUtf8, fromBase64, LazyJsonString, parseEpochTimestamp, parseRfc7231DateTime, parseRfc3339DateTimeWithOffset, generateIdempotencyToken, toBase64, dateToUtcString, expectUnion } = require_serde();
	var { parseXML, XmlNode, XmlText } = (init_dist_es$1(), __toCommonJS(dist_es_exports$3));
	var ProtocolLib = class {
		queryCompat;
		errorRegistry;
		constructor(queryCompat = false) {
			this.queryCompat = queryCompat;
		}
		resolveRestContentType(defaultContentType, inputSchema) {
			const members = inputSchema.getMemberSchemas();
			const httpPayloadMember = Object.values(members).find((m) => {
				return !!m.getMergedTraits().httpPayload;
			});
			if (httpPayloadMember) {
				const mediaType = httpPayloadMember.getMergedTraits().mediaType;
				if (mediaType) return mediaType;
				else if (httpPayloadMember.isStringSchema()) return "text/plain";
				else if (httpPayloadMember.isBlobSchema()) return "application/octet-stream";
				else return defaultContentType;
			} else if (!inputSchema.isUnitSchema()) {
				if (Object.values(members).find((m) => {
					const { httpQuery, httpQueryParams, httpHeader, httpLabel, httpPrefixHeaders } = m.getMergedTraits();
					return !httpQuery && !httpQueryParams && !httpHeader && !httpLabel && httpPrefixHeaders === void 0;
				})) return defaultContentType;
			}
		}
		async getErrorSchemaOrThrowBaseException(errorIdentifier, defaultNamespace, response, dataObject, metadata, getErrorSchema) {
			let errorName = errorIdentifier;
			if (errorIdentifier.includes("#")) [, errorName] = errorIdentifier.split("#");
			const errorMetadata = {
				$metadata: metadata,
				$fault: response.statusCode < 500 ? "client" : "server"
			};
			if (!this.errorRegistry) throw new Error("@aws-sdk/core/protocols - error handler not initialized.");
			try {
				return {
					errorSchema: getErrorSchema?.(this.errorRegistry, errorName) ?? this.errorRegistry.getSchema(errorIdentifier),
					errorMetadata
				};
			} catch (e) {
				dataObject.message = dataObject.message ?? dataObject.Message ?? "UnknownError";
				const synthetic = this.errorRegistry;
				const baseExceptionSchema = synthetic.getBaseException();
				if (baseExceptionSchema) {
					const ErrorCtor = synthetic.getErrorCtor(baseExceptionSchema) ?? Error;
					throw this.decorateServiceException(Object.assign(new ErrorCtor({ name: errorName }), errorMetadata), dataObject);
				}
				const d = dataObject;
				const message = d?.message ?? d?.Message ?? d?.Error?.Message ?? d?.Error?.message;
				throw this.decorateServiceException(Object.assign(new Error(message), { name: errorName }, errorMetadata), dataObject);
			}
		}
		compose(composite, errorIdentifier, defaultNamespace) {
			let namespace = defaultNamespace;
			if (errorIdentifier.includes("#")) [namespace] = errorIdentifier.split("#");
			const staticRegistry = TypeRegistry.for(namespace);
			const defaultSyntheticRegistry = TypeRegistry.for("smithy.ts.sdk.synthetic." + defaultNamespace);
			composite.copyFrom(staticRegistry);
			composite.copyFrom(defaultSyntheticRegistry);
			this.errorRegistry = composite;
		}
		decorateServiceException(exception, additions = {}) {
			if (this.queryCompat) {
				const msg = exception.Message ?? additions.Message;
				const error = decorateServiceException(exception, additions);
				if (msg) error.message = msg;
				const errorObj = error.Error ?? {};
				errorObj.Type = error.Error?.Type;
				errorObj.Code = error.Error?.Code;
				errorObj.Message = error.Error?.message ?? error.Error?.Message ?? msg;
				error.Error = errorObj;
				const reqId = error.$metadata.requestId;
				if (reqId) error.RequestId = reqId;
				return error;
			}
			return decorateServiceException(exception, additions);
		}
		setQueryCompatError(output, response) {
			const queryErrorHeader = response.headers?.["x-amzn-query-error"];
			if (output !== void 0 && queryErrorHeader != null) {
				const [Code, Type] = queryErrorHeader.split(";");
				const keys = Object.keys(output);
				const Error = {
					Code,
					Type
				};
				output.Code = Code;
				output.Type = Type;
				for (let i = 0; i < keys.length; i++) {
					const k = keys[i];
					Error[k === "message" ? "Message" : k] = output[k];
				}
				delete Error.__type;
				output.Error = Error;
			}
		}
		queryCompatOutput(queryCompatErrorData, errorData) {
			if (queryCompatErrorData.Error) errorData.Error = queryCompatErrorData.Error;
			if (queryCompatErrorData.Type) errorData.Type = queryCompatErrorData.Type;
			if (queryCompatErrorData.Code) errorData.Code = queryCompatErrorData.Code;
		}
		findQueryCompatibleError(registry, errorName) {
			try {
				return registry.getSchema(errorName);
			} catch (e) {
				return registry.find((schema) => NormalizedSchema.of(schema).getMergedTraits().awsQueryError?.[0] === errorName);
			}
		}
	};
	var AwsSmithyRpcV2CborProtocol = class extends SmithyRpcV2CborProtocol {
		awsQueryCompatible;
		mixin;
		constructor({ defaultNamespace, errorTypeRegistries, awsQueryCompatible }) {
			super({
				defaultNamespace,
				errorTypeRegistries
			});
			this.awsQueryCompatible = !!awsQueryCompatible;
			this.mixin = new ProtocolLib(this.awsQueryCompatible);
		}
		async serializeRequest(operationSchema, input, context) {
			const request = await super.serializeRequest(operationSchema, input, context);
			if (this.awsQueryCompatible) request.headers["x-amzn-query-mode"] = "true";
			return request;
		}
		async handleError(operationSchema, context, response, dataObject, metadata) {
			if (this.awsQueryCompatible) this.mixin.setQueryCompatError(dataObject, response);
			const errorName = (() => {
				const compatHeader = response.headers["x-amzn-query-error"];
				if (compatHeader && this.awsQueryCompatible) return compatHeader.split(";")[0];
				return loadSmithyRpcV2CborErrorCode(response, dataObject) ?? "Unknown";
			})();
			this.mixin.compose(this.compositeErrorRegistry, errorName, this.options.defaultNamespace);
			const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorName, this.options.defaultNamespace, response, dataObject, metadata, this.awsQueryCompatible ? this.mixin.findQueryCompatibleError : void 0);
			const ns = NormalizedSchema.of(errorSchema);
			const message = dataObject.message ?? dataObject.Message ?? "UnknownError";
			const exception = new ((this.compositeErrorRegistry.getErrorCtor(errorSchema)) ?? Error)({});
			const output = {};
			for (const [name, member] of ns.structIterator()) if (dataObject[name] != null) output[name] = this.deserializer.readValue(member, dataObject[name]);
			if (this.awsQueryCompatible) this.mixin.queryCompatOutput(dataObject, output);
			throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
				$fault: ns.getMergedTraits().error,
				message
			}, output), dataObject);
		}
	};
	var SerdeContextConfig = class {
		serdeContext;
		setSerdeContext(serdeContext) {
			this.serdeContext = serdeContext;
		}
	};
	var UnionSerde = class {
		from;
		to;
		keys;
		constructor(from, to) {
			this.from = from;
			this.to = to;
			const keys = Object.keys(this.from);
			const set = new Set(keys);
			set.delete("__type");
			this.keys = set;
		}
		mark(key) {
			this.keys.delete(key);
		}
		hasUnknown() {
			return this.keys.size === 1 && Object.keys(this.to).length === 0;
		}
		writeUnknown() {
			if (this.hasUnknown()) {
				const k = this.keys.values().next().value;
				const v = this.from[k];
				this.to.$unknown = [k, v];
			}
		}
	};
	var canParseBuffer;
	function detectBufferParsing() {
		if (canParseBuffer === void 0) try {
			if (typeof Buffer !== "function") canParseBuffer = false;
			else {
				const result = JSON.parse(Buffer.from([123, 125]));
				canParseBuffer = result !== null && typeof result === "object";
			}
		} catch {
			canParseBuffer = false;
		}
		return canParseBuffer;
	}
	function jsonReviver(key, value, context) {
		if (context?.source) {
			const numericString = context.source;
			if (typeof value === "number") {
				if (value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER) {
					if (isRepresentable(numericString, value)) return value;
					return new NumericValue(numericString, "bigDecimal");
				} else {
					if (isFractionalBigNumeric(numericString)) return new NumericValue(numericString, "bigDecimal");
					if (/[eE]/.test(numericString)) return expandExponentToBigInt(numericString);
					return BigInt(numericString);
				}
			}
		}
		return value;
	}
	function isFractionalBigNumeric(s) {
		const dotIndex = s.indexOf(".");
		if (dotIndex === -1) return false;
		const eIndex = s.search(/[eE]/);
		if (eIndex === -1) return true;
		const fracDigits = eIndex - dotIndex - 1;
		return parseInt(s.slice(eIndex + 1), 10) < fracDigits;
	}
	function isRepresentable(numericString, value) {
		if (numericString === String(value)) return true;
		if (Object.is(value, -0)) return true;
		if (/[eE]/.test(numericString)) return expandToDecimal(numericString) === expandToDecimal(String(value));
		const normalized = numericString.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
		const canonical = String(value);
		if (normalized === canonical) return true;
		if (/[eE]/.test(canonical)) return normalized === expandToDecimal(canonical);
		return false;
	}
	function expandToDecimal(s) {
		const negative = s.startsWith("-");
		const abs = negative ? s.slice(1) : s;
		const eIndex = abs.search(/[eE]/);
		let result;
		if (eIndex === -1) result = abs;
		else {
			const exp = parseInt(abs.slice(eIndex + 1), 10);
			const mantissa = abs.slice(0, eIndex);
			const dotIndex = mantissa.indexOf(".");
			let digits;
			let intLen;
			if (dotIndex === -1) {
				digits = mantissa;
				intLen = mantissa.length;
			} else {
				digits = mantissa.slice(0, dotIndex) + mantissa.slice(dotIndex + 1);
				intLen = dotIndex;
			}
			digits = digits.replace(/0+$/, "") || "0";
			const newDotPos = intLen + exp;
			if (digits === "0") result = "0";
			else if (newDotPos <= 0) result = "0." + "0".repeat(-newDotPos) + digits;
			else if (newDotPos >= digits.length) result = digits + "0".repeat(newDotPos - digits.length);
			else result = digits.slice(0, newDotPos) + "." + digits.slice(newDotPos);
		}
		if (result.includes(".")) result = result.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
		return (negative ? "-" : "") + result;
	}
	function expandExponentToBigInt(s) {
		const eIndex = s.search(/[eE]/);
		const exp = parseInt(s.slice(eIndex + 1), 10);
		const negative = s.startsWith("-");
		const mantissa = s.slice(negative ? 1 : 0, eIndex);
		const dotIndex = mantissa.indexOf(".");
		let digits;
		let shift;
		if (dotIndex === -1) {
			digits = mantissa;
			shift = exp;
		} else {
			digits = mantissa.slice(0, dotIndex) + mantissa.slice(dotIndex + 1);
			shift = exp - (mantissa.length - dotIndex - 1);
		}
		digits = digits.replace(/0+$/, "") || "0";
		const result = BigInt(digits) * 10n ** BigInt(shift + (mantissa.replace(".", "").length - digits.length));
		return negative ? -result : result;
	}
	var REVIVER_SYMBOL = Symbol.for("@aws-sdk/reviver");
	function needsReviver(schema) {
		const ns = NormalizedSchema.of(schema);
		const raw = ns.getSchema();
		if (Array.isArray(raw) && ns.isStructSchema()) {
			if (REVIVER_SYMBOL in raw) return raw[REVIVER_SYMBOL];
			const result = _check(ns, /* @__PURE__ */ new Set());
			raw[REVIVER_SYMBOL] = result;
			return result;
		}
		return _check(ns, /* @__PURE__ */ new Set());
	}
	function _check(ns, seen) {
		const raw = ns.getSchema();
		if (seen.has(raw)) return false;
		seen.add(raw);
		if (ns.isBigIntegerSchema() || ns.isBigDecimalSchema()) return true;
		if (ns.isStructSchema()) {
			for (const [, memberSchema] of ns.structIterator()) if (_check(memberSchema, seen)) return true;
		} else if (ns.isListSchema() || ns.isMapSchema()) {
			if (_check(ns.getValueSchema(), seen)) return true;
		} else if (ns.isDocumentSchema()) return true;
		return false;
	}
	var collectBodyString = (streamBody, context) => collectBody(streamBody, context).then((body) => (context?.utf8Encoder ?? toUtf8)(body));
	async function parseJsonBody(streamBody, context, schema) {
		let parsingInput;
		if (detectBufferParsing() && typeof streamBody?.[Symbol.asyncIterator] === "function") {
			const buffer = await collectBody(streamBody, context);
			if (typeof Buffer === "function") {
				if (Buffer.isBuffer(buffer)) parsingInput = buffer;
				else parsingInput = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
			}
		}
		if (!parsingInput) parsingInput = await collectBodyString(streamBody, context);
		if (parsingInput.length === 0) return {};
		const reviver = schema && needsReviver(schema) ? jsonReviver : void 0;
		try {
			return JSON.parse(parsingInput, reviver);
		} catch (e) {
			if (e?.name === "SyntaxError") Object.defineProperty(e, "$responseBodyText", { value: typeof parsingInput === "string" ? parsingInput : parsingInput.toString("utf8") });
			throw e;
		}
	}
	var parseJsonErrorBody = async (errorBody, context) => {
		const value = await parseJsonBody(errorBody, context);
		value.message = value.message ?? value.Message;
		return value;
	};
	var findKey = (object, key) => Object.keys(object).find((k) => k.toLowerCase() === key.toLowerCase());
	var sanitizeErrorCode = (rawValue) => {
		let cleanValue = rawValue;
		if (typeof cleanValue === "number") cleanValue = cleanValue.toString();
		if (cleanValue.indexOf(",") >= 0) cleanValue = cleanValue.split(",")[0];
		if (cleanValue.indexOf(":") >= 0) cleanValue = cleanValue.split(":")[0];
		if (cleanValue.indexOf("#") >= 0) cleanValue = cleanValue.split("#")[1];
		return cleanValue;
	};
	var loadRestJsonErrorCode = (output, data) => {
		return loadErrorCode(output, data, [
			"header",
			"code",
			"type"
		]);
	};
	var loadJsonRpcErrorCode = (output, data, queryCompat = false) => {
		return loadErrorCode(output, data, queryCompat ? [
			"code",
			"header",
			"type"
		] : [
			"type",
			"code",
			"header"
		]);
	};
	var loadErrorCode = ({ headers }, data, order) => {
		while (order.length > 0) switch (order.shift()) {
			case "header":
				const headerKey = findKey(headers ?? {}, "x-amzn-errortype");
				if (headerKey !== void 0) return sanitizeErrorCode(headers[headerKey]);
				break;
			case "code":
				const codeKey = findKey(data ?? {}, "code");
				if (codeKey && data[codeKey] !== void 0) return sanitizeErrorCode(data[codeKey]);
				break;
			case "type": if (data?.__type !== void 0) return sanitizeErrorCode(data.__type);
		}
	};
	function writeKey(obj) {
		Object.defineProperty(obj, "__proto__", {
			value: void 0,
			writable: true,
			enumerable: true,
			configurable: true
		});
	}
	var JsonShapeDeserializer2 = class extends SerdeContextConfig {
		settings;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		async read(schema, data) {
			const reviver = needsReviver(schema) ? jsonReviver : void 0;
			let parsed;
			if (typeof data === "string") {
				if (data.length === 0) return {};
				parsed = JSON.parse(data, reviver);
			} else if (data instanceof Uint8Array && detectBufferParsing()) {
				if (data.byteLength === 0) return {};
				const buf = Buffer.isBuffer(data) ? data : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
				parsed = JSON.parse(buf, reviver);
			} else parsed = await parseJsonBody(data, this.serdeContext, schema);
			return this._read(schema, parsed);
		}
		readObject(schema, data) {
			return this._read(schema, data);
		}
		_read(schema, value) {
			const isObject = value !== null && typeof value === "object";
			const ns = NormalizedSchema.of(schema);
			if (isObject) {
				if (ns.isStructSchema()) return this._readStruct(ns, value);
				if (Array.isArray(value) && ns.isListSchema()) {
					const listMember = ns.getValueSchema();
					if (this.needsTransform(listMember)) for (let i = 0; i < value.length; ++i) value[i] = this._read(listMember, value[i]);
					return value;
				}
				if (ns.isMapSchema()) {
					const mapMember = ns.getValueSchema();
					const map = value;
					if (this.needsTransform(mapMember)) for (const k in map) {
						if (k === "__proto__") writeKey(map);
						map[k] = this._read(mapMember, map[k]);
					}
					return map;
				}
			}
			if (ns.isBlobSchema() && typeof value === "string") return fromBase64(value);
			const mediaType = ns.getMergedTraits().mediaType;
			if (ns.isStringSchema() && typeof value === "string" && mediaType) {
				if (mediaType === "application/json" || mediaType.endsWith("+json")) return LazyJsonString.from(value);
				return value;
			}
			if (ns.isTimestampSchema() && value != null) switch (determineTimestampFormat(ns, this.settings)) {
				case 5: return parseRfc3339DateTimeWithOffset(value);
				case 6: return parseRfc7231DateTime(value);
				case 7: return parseEpochTimestamp(value);
				default:
					console.warn("Missing timestamp format, parsing value with Date constructor:", value);
					return new Date(value);
			}
			if (ns.isBigIntegerSchema() && (typeof value === "number" || typeof value === "string")) return BigInt(value);
			if (ns.isBigDecimalSchema() && value != void 0) {
				if (value instanceof NumericValue) return value;
				const untyped = value;
				if (untyped.type === "bigDecimal" && "string" in untyped) return new NumericValue(untyped.string, untyped.type);
				return new NumericValue(String(value), "bigDecimal");
			}
			if (ns.isNumericSchema() && typeof value === "string") {
				switch (value) {
					case "Infinity": return Infinity;
					case "-Infinity": return -Infinity;
					case "NaN": return NaN;
				}
				return value;
			}
			if (ns.isDocumentSchema()) {
				if (isObject) {
					if (Array.isArray(value)) for (let i = 0; i < value.length; ++i) {
						const v = value[i];
						if (!(v instanceof NumericValue)) value[i] = this._read(ns, v);
					}
					else {
						const doc = value;
						for (const k in doc) {
							if (k === "__proto__") writeKey(doc);
							const v = doc[k];
							if (!(v instanceof NumericValue)) doc[k] = this._read(ns, v);
						}
					}
				}
			}
			return value;
		}
		_readStruct(ns, record) {
			const union = ns.isUnionSchema();
			const out = {};
			let nameMap;
			const hasType = typeof record.__type === "string";
			const { jsonName } = this.settings;
			if (jsonName && hasType) nameMap = {};
			let unionSerde;
			if (union) unionSerde = new UnionSerde(record, out);
			for (const [memberName, memberSchema] of ns.structIterator()) {
				let fromKey = memberName;
				if (jsonName) {
					fromKey = memberSchema.getMergedTraits().jsonName ?? fromKey;
					if (hasType) nameMap[fromKey] = memberName;
				}
				if (union) unionSerde.mark(fromKey);
				if (record[fromKey] != null) out[memberName] = this._read(memberSchema, record[fromKey]);
			}
			if (union) unionSerde.writeUnknown();
			else if (hasType) for (const k in record) {
				const v = record[k];
				const t = jsonName ? nameMap[k] ?? k : k;
				if (!(t in out)) out[t] = v;
			}
			return out;
		}
		needsTransform(ns) {
			if (ns.isBlobSchema() || ns.isTimestampSchema() || ns.isBigIntegerSchema() || ns.isBigDecimalSchema()) return true;
			if (ns.isDocumentSchema() || ns.isStructSchema() || ns.isListSchema() || ns.isMapSchema()) return true;
			if (ns.isStringSchema() && ns.getMergedTraits().mediaType) return true;
			return false;
		}
	};
	var JsonBytesStringAdapter = class JsonBytesStringAdapter extends Uint8Array {
		string = null;
		static allocUnsafe(bytes) {
			if (typeof Buffer === "function") {
				const buffer = Buffer.allocUnsafe(bytes);
				return new JsonBytesStringAdapter(buffer.buffer, buffer.byteOffset, buffer.byteLength);
			}
			return new JsonBytesStringAdapter(bytes);
		}
		toString() {
			return this.s();
		}
		valueOf() {
			return this.s();
		}
		includes(searchString, position) {
			if (typeof searchString === "string") return this.s().includes(searchString, position);
			return Uint8Array.prototype.includes.call(this, searchString, position);
		}
		indexOf(searchString, position) {
			if (typeof searchString === "string") return this.s().indexOf(searchString, position);
			return Uint8Array.prototype.indexOf.call(this, searchString, position);
		}
		lastIndexOf(searchString, position) {
			if (typeof searchString === "string") return this.s().lastIndexOf(searchString, position);
			const fn = Uint8Array.prototype.lastIndexOf;
			if (position !== void 0) return fn.call(this, searchString, position);
			return fn.call(this, searchString);
		}
		startsWith(searchString, position) {
			return this.s().startsWith(searchString, position);
		}
		endsWith(searchString, endPosition) {
			return this.s().endsWith(searchString, endPosition);
		}
		match(regexp) {
			return this.s().match(regexp);
		}
		replace(searchValue, replaceValue) {
			return this.s().replace(searchValue, replaceValue);
		}
		search(regexp) {
			return this.s().search(regexp);
		}
		split(separator, limit) {
			return this.s().split(separator, limit);
		}
		substring(start, end) {
			return this.s().substring(start, end);
		}
		trim() {
			return this.s().trim();
		}
		trimStart() {
			return this.s().trimStart();
		}
		trimEnd() {
			return this.s().trimEnd();
		}
		charAt(pos) {
			return this.s().charAt(pos);
		}
		charCodeAt(index) {
			return this.s().charCodeAt(index);
		}
		padStart(maxLength, fillString) {
			return this.s().padStart(maxLength, fillString);
		}
		padEnd(maxLength, fillString) {
			return this.s().padEnd(maxLength, fillString);
		}
		repeat(count) {
			return this.s().repeat(count);
		}
		toUpperCase() {
			return this.s().toUpperCase();
		}
		toLowerCase() {
			return this.s().toLowerCase();
		}
		s() {
			if (this.string == null) {
				const n = Date.now();
				if (n > warned + 6e4) {
					console.warn("@aws-sdk/core/protocols - WARN - JsonCodec2: you have called a string method on a Uint8Array request body. It has been automatically converted to string. In a future version this will throw an error.");
					warned = n;
				}
				this.string = toUtf8(this);
			}
			return this.string;
		}
	};
	var warned = 0;
	var encoder = new TextEncoder();
	var OPEN_BRACE = 123;
	var CLOSE_BRACE = 125;
	var OPEN_BRACKET = 91;
	var CLOSE_BRACKET = 93;
	var QUOTE = 34;
	var COLON = 58;
	var COMMA = 44;
	var BACKSLASH = 92;
	var TRUE = new Uint8Array([
		116,
		114,
		117,
		101
	]);
	var FALSE = new Uint8Array([
		102,
		97,
		108,
		115,
		101
	]);
	var NULL = new Uint8Array([
		110,
		117,
		108,
		108
	]);
	var ESCAPE_TABLE = new Array(128).fill(null);
	ESCAPE_TABLE[8] = "b";
	ESCAPE_TABLE[9] = "t";
	ESCAPE_TABLE[10] = "n";
	ESCAPE_TABLE[12] = "f";
	ESCAPE_TABLE[13] = "r";
	ESCAPE_TABLE[34] = "\"";
	ESCAPE_TABLE[92] = "\\";
	for (let i = 0; i < 32; i++) if (ESCAPE_TABLE[i] === null) ESCAPE_TABLE[i] = "u00" + i.toString(16).padStart(2, "0");
	var INITIAL_BUFFER_SIZE = 2048;
	function alloc(size) {
		return JsonBytesStringAdapter.allocUnsafe(size);
	}
	var JsonShapeSerializer2 = class JsonShapeSerializer2 extends SerdeContextConfig {
		settings;
		json;
		i = 0;
		rootSchema;
		rawValue;
		passthrough = false;
		constructor(settings) {
			super();
			this.settings = settings;
			this.json = alloc(INITIAL_BUFFER_SIZE);
		}
		write(schema, value) {
			this.i = 0;
			this.rawValue = value;
			this.rootSchema = NormalizedSchema.of(schema);
			this.passthrough = this.rootSchema.isBlobSchema() || this.rootSchema.isStringSchema();
			if (!this.passthrough) this.writeValue(this.rootSchema, value, void 0);
		}
		writeDiscriminatedDocument(schema, value) {
			this.i = 0;
			this.rootSchema = NormalizedSchema.of(schema);
			const ns = this.rootSchema;
			if (ns.isStructSchema() && value != null && typeof value === "object") {
				this.writeValue(ns, value, void 0);
				const prefix = `"__type":"${ns.getName(true) ?? "Unknown"}",`;
				const z = prefix.length;
				this.ensure(z);
				this.json.copyWithin(1 + z, 1, this.i);
				encoder.encodeInto(prefix, this.json.subarray(1));
				this.i += z;
			} else this.writeValue(ns, value, void 0);
		}
		flush() {
			this.rootSchema = void 0;
			const finalPosition = this.i;
			this.i = 0;
			const raw = this.rawValue;
			this.rawValue = void 0;
			if (finalPosition === 0) return raw;
			const result = this.json.subarray(0, finalPosition);
			this.json = alloc(INITIAL_BUFFER_SIZE);
			return result;
		}
		ensure(byteCount) {
			const { i, json } = this;
			if (i + byteCount > json.length) {
				let newSize = json.length * 2;
				while (newSize < i + byteCount) newSize *= 2;
				const next = alloc(newSize);
				next.set(this.json);
				this.json = next;
			}
		}
		writeAscii(s) {
			const z = s.length;
			this.ensure(z);
			let { i, json } = this;
			for (let j = 0; j < z; ++j) {
				json[i] = s.charCodeAt(j);
				i += 1;
			}
			this.i = i;
		}
		writeAsciiQuoted(s) {
			const z = s.length;
			this.ensure(z + 4);
			let { json, i } = this;
			json[i++] = QUOTE;
			for (let j = 0; j < z; ++j) json[i++] = s.charCodeAt(j);
			json[i++] = QUOTE;
			this.i = i;
		}
		writeJsonString(s) {
			this.ensure(s.length * 3 + 2);
			this.json[this.i++] = QUOTE;
			const z = s.length;
			for (let j = 0; j < z; ++j) {
				const c = s.charCodeAt(j);
				if (c > 34 && c < 92) this.json[this.i++] = c;
				else if (c < 128) {
					const esc = ESCAPE_TABLE[c];
					if (esc !== null) {
						this.ensure(esc.length + 1);
						this.json[this.i++] = BACKSLASH;
						for (let k = 0; k < esc.length; k++) this.json[this.i++] = esc.charCodeAt(k);
					} else this.json[this.i++] = c;
				} else if (c >= 55296 && c <= 56319) {
					const next = j + 1 < z ? s.charCodeAt(j + 1) : 0;
					if (next >= 56320 && next <= 57343) {
						this.ensure(4);
						const { written } = encoder.encodeInto(s.substring(j, j + 2), this.json.subarray(this.i));
						this.i += written;
						++j;
					} else {
						this.ensure(6);
						this.writeUnicodeEscape(c);
					}
				} else if (c >= 56320 && c <= 57343) {
					this.ensure(6);
					this.writeUnicodeEscape(c);
				} else {
					let { i, json } = this;
					if (c < 2048) {
						json[i++] = 192 | c >> 6;
						json[i++] = 128 | c & 63;
					} else {
						json[i++] = 224 | c >> 12;
						json[i++] = 128 | c >> 6 & 63;
						json[i++] = 128 | c & 63;
					}
					this.i = i;
				}
			}
			this.json[this.i++] = QUOTE;
		}
		writeUnicodeEscape(code) {
			let { json, i } = this;
			json[i++] = BACKSLASH;
			json[i++] = 117;
			const hex = code.toString(16).padStart(4, "0");
			for (let j = 0; j < 4; ++j) json[i++] = hex.charCodeAt(j);
			this.i = i;
		}
		static B64 = (() => {
			const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
			const table = /* @__PURE__ */ new Uint8Array(64);
			for (let i = 0; i < 64; ++i) table[i] = chars.charCodeAt(i);
			return table;
		})();
		writeBase64(data) {
			const b64Len = Math.ceil(data.length / 3) * 4;
			this.ensure(b64Len + 2);
			const json = this.json;
			const B64 = JsonShapeSerializer2.B64;
			let i = this.i;
			json[i++] = QUOTE;
			const len = data.length;
			const remainder = len % 3;
			const mainLen = len - remainder;
			for (let j = 0; j < mainLen; j += 3) {
				const a = data[j];
				const b = data[j + 1];
				const c = data[j + 2];
				json[i++] = B64[a >> 2];
				json[i++] = B64[(a & 3) << 4 | b >> 4];
				json[i++] = B64[(b & 15) << 2 | c >> 6];
				json[i++] = B64[c & 63];
			}
			if (remainder === 2) {
				const a = data[mainLen];
				const b = data[mainLen + 1];
				json[i++] = B64[a >> 2];
				json[i++] = B64[(a & 3) << 4 | b >> 4];
				json[i++] = B64[(b & 15) << 2];
				json[i++] = 61;
			} else if (remainder === 1) {
				const a = data[mainLen];
				json[i++] = B64[a >> 2];
				json[i++] = B64[(a & 3) << 4];
				json[i++] = 61;
				json[i++] = 61;
			}
			json[i++] = QUOTE;
			this.i = i;
		}
		writeValue(schema, value, container) {
			if (value == null) {
				if (container?.isStructSchema()) {
					if (value === void 0) {
						if (NormalizedSchema.of(schema).isIdempotencyToken()) {
							this.writeAsciiQuoted(generateIdempotencyToken());
							return;
						}
					}
					return;
				}
				this.ensure(4);
				this.json.set(NULL, this.i);
				this.i += 4;
				return;
			}
			const ns = NormalizedSchema.of(schema);
			const isObject = typeof value === "object";
			if (ns.isStringSchema()) {
				const mediaType = ns.getMergedTraits().mediaType;
				if (mediaType) {
					if (mediaType === "application/json" || mediaType.endsWith("+json")) {
						this.writeJsonString(LazyJsonString.from(value).toString());
						return;
					}
				}
			}
			if (isObject) {
				if (ns.isStructSchema()) {
					this.writeStruct(ns, value);
					return;
				}
				if (Array.isArray(value) && (ns.isListSchema() || ns.isDocumentSchema())) {
					this.writeList(ns, value, ns.isDocumentSchema());
					return;
				}
				if (ns.isMapSchema()) {
					this.writeMap(ns, value, false);
					return;
				}
				if (value instanceof Uint8Array && (ns.isBlobSchema() || ns.isDocumentSchema())) {
					this.writeBase64(value);
					return;
				}
				if (value instanceof Date && (ns.isTimestampSchema() || ns.isDocumentSchema())) {
					this.writeTimestamp(ns, value);
					return;
				}
				if (value instanceof NumericValue) {
					this.writeAscii(value.string);
					return;
				}
				if (ns.isDocumentSchema()) {
					if (Array.isArray(value)) this.writeList(ns, value, true);
					else this.writeMap(ns, value, true);
					return;
				}
				const json = JSON.stringify(value);
				this.writeAscii(json);
				return;
			}
			if (typeof value === "string") {
				if (ns.isBlobSchema()) {
					const b64 = (this.serdeContext?.base64Encoder ?? toBase64)(value);
					this.writeAsciiQuoted(b64);
					return;
				}
				this.writeJsonString(value);
				return;
			}
			if (typeof value === "number") {
				if (Math.abs(value) === Infinity || Number.isNaN(value)) {
					this.writeAsciiQuoted(String(value));
					return;
				}
				const numStr = String(value);
				this.writeAscii(numStr);
				return;
			}
			if (typeof value === "boolean") {
				this.ensure(5);
				let { i, json } = this;
				if (value) {
					json.set(TRUE, i);
					i += 4;
				} else {
					json.set(FALSE, i);
					i += 5;
				}
				this.i = i;
				return;
			}
			if (typeof value === "bigint") {
				this.writeAscii(value.toString());
				return;
			}
			this.writeAscii(String(value));
		}
		writeStruct(ns, value) {
			this.ensure(2);
			this.json[this.i++] = OPEN_BRACE;
			let wroteAny = false;
			const hasType = typeof value.__type === "string";
			let writtenKeys;
			if (hasType) writtenKeys = /* @__PURE__ */ new Set();
			for (const [memberName, memberSchema] of ns.structIterator()) {
				const item = value[memberName];
				if (item == null && !memberSchema.isIdempotencyToken()) continue;
				if (wroteAny) {
					this.ensure(1);
					this.json[this.i++] = COMMA;
				}
				wroteAny = true;
				const targetKey = this.settings.jsonName ? memberSchema.getMergedTraits().jsonName ?? memberName : memberName;
				if (writtenKeys) {
					writtenKeys.add(memberName);
					writtenKeys.add(targetKey);
				}
				this.writeAsciiQuoted(targetKey);
				this.json[this.i++] = COLON;
				this.writeValue(memberSchema, item, ns);
			}
			if (!wroteAny && ns.isUnionSchema()) {
				const { $unknown } = value;
				if (Array.isArray($unknown)) {
					const [k, v] = $unknown;
					this.writeAsciiQuoted(k);
					this.ensure(1);
					this.json[this.i++] = COLON;
					this.writeValue(15, v, ns);
				}
			} else if (hasType) for (const k in value) {
				if (writtenKeys.has(k)) continue;
				writtenKeys.add(k);
				const v = value[k];
				if (wroteAny) {
					this.ensure(1);
					this.json[this.i++] = COMMA;
				}
				wroteAny = true;
				this.writeAsciiQuoted(k);
				this.ensure(1);
				this.json[this.i++] = COLON;
				this.writeValue(15, v, void 0);
			}
			this.ensure(1);
			this.json[this.i++] = CLOSE_BRACE;
		}
		writeList(ns, value, isDocument) {
			const sparse = !!ns.getMergedTraits().sparse;
			const valueSchema = ns.getValueSchema();
			if (!isDocument) {
				if (valueSchema.isStringSchema() || valueSchema.isNumericSchema() || valueSchema.isBooleanSchema()) {
					let hasSpecials = false;
					for (let i = 0; i < value.length; ++i) {
						const v = value[i];
						if (Number.isNaN(v) || v === Infinity || v === -Infinity || v == null && !sparse) {
							hasSpecials = true;
							break;
						}
					}
					let json;
					if (!hasSpecials) json = JSON.stringify(value);
					else {
						const out = [];
						for (let i = 0; i < value.length; ++i) {
							const v = value[i];
							if (v == null && !sparse) continue;
							if (Number.isNaN(v) || v === Infinity || v === -Infinity) out.push(String(v));
							else out.push(v);
						}
						json = JSON.stringify(out);
					}
					this.ensure(json.length * 3);
					this.i += encoder.encodeInto(json, this.json.subarray(this.i)).written;
					return;
				}
			}
			this.ensure(2);
			this.json[this.i++] = OPEN_BRACKET;
			let wroteFirstItem = false;
			for (let i = 0; i < value.length; ++i) {
				const item = value[i];
				if (isDocument ? item === void 0 : item == null && !sparse) continue;
				if (wroteFirstItem) {
					this.ensure(1);
					this.json[this.i++] = COMMA;
				}
				this.writeValue(valueSchema, item, void 0);
				wroteFirstItem = true;
			}
			this.ensure(1);
			this.json[this.i++] = CLOSE_BRACKET;
		}
		writeMap(ns, value, isDocument) {
			const sparse = !!ns.getMergedTraits().sparse;
			const valueSchema = ns.getValueSchema();
			if (!isDocument) {
				if (valueSchema.isStringSchema() || valueSchema.isNumericSchema() || valueSchema.isBooleanSchema()) {
					let modifications;
					for (const k in value) {
						const v = value[k];
						if (Number.isNaN(v) || v === Infinity || v === -Infinity) {
							(modifications ??= {})[k] = v;
							value[k] = String(v);
						} else if (v === null && !sparse) {
							(modifications ??= {})[k] = null;
							value[k] = void 0;
						}
					}
					const json = JSON.stringify(value);
					if (modifications) Object.assign(value, modifications);
					this.ensure(json.length * 3);
					this.i += encoder.encodeInto(json, this.json.subarray(this.i)).written;
					return;
				}
			}
			this.ensure(2);
			this.json[this.i++] = OPEN_BRACE;
			let first = true;
			for (const k in value) {
				const v = value[k];
				if (isDocument ? v === void 0 : v == null && !sparse) continue;
				if (!first) {
					this.ensure(1);
					this.json[this.i++] = COMMA;
				}
				first = false;
				this.writeJsonString(k);
				this.ensure(1);
				this.json[this.i++] = COLON;
				this.writeValue(valueSchema, v, void 0);
			}
			this.ensure(1);
			this.json[this.i++] = CLOSE_BRACE;
		}
		writeTimestamp(ns, value) {
			switch (determineTimestampFormat(ns, this.settings)) {
				case 5: {
					const iso = value.toISOString().replace(".000Z", "Z");
					this.writeAsciiQuoted(iso);
					return;
				}
				case 6:
					this.writeAsciiQuoted(dateToUtcString(value));
					return;
				case 7: {
					const epochSecs = String(value.getTime() / 1e3);
					this.writeAscii(epochSecs);
					return;
				}
				default: {
					const epochSecs = String(value.getTime() / 1e3);
					this.writeAscii(epochSecs);
					return;
				}
			}
		}
	};
	var JsonCodec2 = class extends SerdeContextConfig {
		settings;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		createSerializer() {
			const serializer = new JsonShapeSerializer2(this.settings);
			serializer.setSerdeContext(this.serdeContext);
			return serializer;
		}
		createDeserializer() {
			const deserializer = new JsonShapeDeserializer2(this.settings);
			deserializer.setSerdeContext(this.serdeContext);
			return deserializer;
		}
	};
	var AwsJsonRpcProtocol = class extends RpcProtocol {
		serializer;
		deserializer;
		serviceTarget;
		codec;
		mixin;
		awsQueryCompatible;
		constructor({ defaultNamespace, errorTypeRegistries, serviceTarget, awsQueryCompatible, jsonCodec }) {
			super({
				defaultNamespace,
				errorTypeRegistries
			});
			this.serviceTarget = serviceTarget;
			this.codec = jsonCodec ?? new JsonCodec2({
				timestampFormat: {
					useTrait: true,
					default: 7
				},
				jsonName: false
			});
			this.serializer = this.codec.createSerializer();
			this.deserializer = this.codec.createDeserializer();
			this.awsQueryCompatible = !!awsQueryCompatible;
			this.mixin = new ProtocolLib(this.awsQueryCompatible);
		}
		async serializeRequest(operationSchema, input, context) {
			const request = await super.serializeRequest(operationSchema, input, context);
			if (!request.path.endsWith("/")) request.path += "/";
			request.headers["content-type"] = `application/x-amz-json-${this.getJsonRpcVersion()}`;
			request.headers["x-amz-target"] = `${this.serviceTarget}.${operationSchema.name}`;
			if (this.awsQueryCompatible) request.headers["x-amzn-query-mode"] = "true";
			if (deref(operationSchema.input) === "unit" || !request.body) request.body = "{}";
			return request;
		}
		getPayloadCodec() {
			return this.codec;
		}
		async handleError(operationSchema, context, response, dataObject, metadata) {
			const { awsQueryCompatible } = this;
			if (awsQueryCompatible) this.mixin.setQueryCompatError(dataObject, response);
			const errorIdentifier = loadJsonRpcErrorCode(response, dataObject, awsQueryCompatible) ?? "Unknown";
			this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
			const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, dataObject, metadata, awsQueryCompatible ? this.mixin.findQueryCompatibleError : void 0);
			const ns = NormalizedSchema.of(errorSchema);
			const message = dataObject.message ?? dataObject.Message ?? "UnknownError";
			const exception = new ((this.compositeErrorRegistry.getErrorCtor(errorSchema)) ?? Error)({});
			const output = {};
			const errorDeserializer = this.codec.createDeserializer();
			for (const [name, member] of ns.structIterator()) if (dataObject[name] != null) output[name] = errorDeserializer.readObject(member, dataObject[name]);
			if (awsQueryCompatible) this.mixin.queryCompatOutput(dataObject, output);
			throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
				$fault: ns.getMergedTraits().error,
				message
			}, output), dataObject);
		}
	};
	var AwsJson1_0Protocol = class extends AwsJsonRpcProtocol {
		constructor({ defaultNamespace, errorTypeRegistries, serviceTarget, awsQueryCompatible, jsonCodec }) {
			super({
				defaultNamespace,
				errorTypeRegistries,
				serviceTarget,
				awsQueryCompatible,
				jsonCodec
			});
		}
		getShapeId() {
			return "aws.protocols#awsJson1_0";
		}
		getJsonRpcVersion() {
			return "1.0";
		}
		getDefaultContentType() {
			return "application/x-amz-json-1.0";
		}
	};
	var AwsJson1_1Protocol = class extends AwsJsonRpcProtocol {
		constructor({ defaultNamespace, errorTypeRegistries, serviceTarget, awsQueryCompatible, jsonCodec }) {
			super({
				defaultNamespace,
				errorTypeRegistries,
				serviceTarget,
				awsQueryCompatible,
				jsonCodec
			});
		}
		getShapeId() {
			return "aws.protocols#awsJson1_1";
		}
		getJsonRpcVersion() {
			return "1.1";
		}
		getDefaultContentType() {
			return "application/x-amz-json-1.1";
		}
	};
	var AwsRestJsonProtocol = class extends HttpBindingProtocol {
		serializer;
		deserializer;
		codec;
		mixin = new ProtocolLib();
		constructor({ defaultNamespace, errorTypeRegistries, jsonCodec }) {
			super({
				defaultNamespace,
				errorTypeRegistries
			});
			const settings = {
				timestampFormat: {
					useTrait: true,
					default: 7
				},
				httpBindings: true,
				jsonName: true
			};
			this.codec = jsonCodec ?? new JsonCodec2(settings);
			this.serializer = new HttpInterceptingShapeSerializer(this.codec.createSerializer(), settings);
			this.deserializer = new HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), settings);
		}
		getShapeId() {
			return "aws.protocols#restJson1";
		}
		getPayloadCodec() {
			return this.codec;
		}
		setSerdeContext(serdeContext) {
			this.codec.setSerdeContext(serdeContext);
			super.setSerdeContext(serdeContext);
		}
		async serializeRequest(operationSchema, input, context) {
			const request = await super.serializeRequest(operationSchema, input, context);
			const inputSchema = NormalizedSchema.of(operationSchema.input);
			if (!request.headers["content-type"]) {
				const contentType = this.mixin.resolveRestContentType(this.getDefaultContentType(), inputSchema);
				if (contentType) request.headers["content-type"] = contentType;
			}
			if (request.body == null && request.headers["content-type"] === this.getDefaultContentType()) request.body = "{}";
			return request;
		}
		async deserializeResponse(operationSchema, context, response) {
			const output = await super.deserializeResponse(operationSchema, context, response);
			const outputSchema = NormalizedSchema.of(operationSchema.output);
			for (const [name, member] of outputSchema.structIterator()) if (member.getMemberTraits().httpPayload && !(name in output)) output[name] = null;
			return output;
		}
		async handleError(operationSchema, context, response, dataObject, metadata) {
			const errorIdentifier = loadRestJsonErrorCode(response, dataObject) ?? "Unknown";
			this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
			const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, dataObject, metadata);
			const ns = NormalizedSchema.of(errorSchema);
			const message = dataObject.message ?? dataObject.Message ?? "UnknownError";
			const exception = new ((this.compositeErrorRegistry.getErrorCtor(errorSchema)) ?? Error)({});
			await this.deserializeHttpMessage(errorSchema, context, response, dataObject);
			const output = {};
			const errorDeserializer = this.codec.createDeserializer();
			for (const [name, member] of ns.structIterator()) {
				const target = member.getMergedTraits().jsonName ?? name;
				output[name] = errorDeserializer.readObject(member, dataObject[target]);
			}
			throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
				$fault: ns.getMergedTraits().error,
				message
			}, output), dataObject);
		}
		getDefaultContentType() {
			return "application/json";
		}
	};
	var JsonShapeDeserializer = class extends SerdeContextConfig {
		settings;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		async read(schema, data) {
			const reviver = needsReviver(schema) ? jsonReviver : void 0;
			return this._read(schema, typeof data === "string" ? JSON.parse(data, reviver) : await parseJsonBody(data, this.serdeContext, schema));
		}
		readObject(schema, data) {
			return this._read(schema, data);
		}
		_read(schema, value) {
			const isObject = value !== null && typeof value === "object";
			const ns = NormalizedSchema.of(schema);
			if (isObject) {
				if (ns.isStructSchema()) {
					const record = value;
					const union = ns.isUnionSchema();
					const out = {};
					let nameMap = void 0;
					const { jsonName } = this.settings;
					if (jsonName) nameMap = {};
					let unionSerde;
					if (union) unionSerde = new UnionSerde(record, out);
					for (const [memberName, memberSchema] of ns.structIterator()) {
						let fromKey = memberName;
						if (jsonName) {
							fromKey = memberSchema.getMergedTraits().jsonName ?? fromKey;
							nameMap[fromKey] = memberName;
						}
						if (union) unionSerde.mark(fromKey);
						if (record[fromKey] != null) out[memberName] = this._read(memberSchema, record[fromKey]);
					}
					if (union) unionSerde.writeUnknown();
					else if (typeof record.__type === "string") for (const k in record) {
						const v = record[k];
						const t = jsonName ? nameMap[k] ?? k : k;
						if (!(t in out)) out[t] = v;
					}
					return out;
				}
				if (Array.isArray(value) && ns.isListSchema()) {
					const listMember = ns.getValueSchema();
					const out = [];
					for (const item of value) out.push(this._read(listMember, item));
					return out;
				}
				if (ns.isMapSchema()) {
					const mapMember = ns.getValueSchema();
					const out = {};
					for (const _k in value) {
						if (_k === "__proto__") writeKey(out);
						out[_k] = this._read(mapMember, value[_k]);
					}
					return out;
				}
			}
			if (ns.isBlobSchema() && typeof value === "string") return fromBase64(value);
			const mediaType = ns.getMergedTraits().mediaType;
			if (ns.isStringSchema() && typeof value === "string" && mediaType) {
				if (mediaType === "application/json" || mediaType.endsWith("+json")) return LazyJsonString.from(value);
				return value;
			}
			if (ns.isTimestampSchema() && value != null) switch (determineTimestampFormat(ns, this.settings)) {
				case 5: return parseRfc3339DateTimeWithOffset(value);
				case 6: return parseRfc7231DateTime(value);
				case 7: return parseEpochTimestamp(value);
				default:
					console.warn("Missing timestamp format, parsing value with Date constructor:", value);
					return new Date(value);
			}
			if (ns.isBigIntegerSchema() && (typeof value === "number" || typeof value === "string")) return BigInt(value);
			if (ns.isBigDecimalSchema() && value != void 0) {
				if (value instanceof NumericValue) return value;
				const untyped = value;
				if (untyped.type === "bigDecimal" && "string" in untyped) return new NumericValue(untyped.string, untyped.type);
				return new NumericValue(String(value), "bigDecimal");
			}
			if (ns.isNumericSchema() && typeof value === "string") {
				switch (value) {
					case "Infinity": return Infinity;
					case "-Infinity": return -Infinity;
					case "NaN": return NaN;
				}
				return value;
			}
			if (ns.isDocumentSchema()) {
				if (isObject) {
					const out = Array.isArray(value) ? [] : {};
					for (const k in value) {
						if (k === "__proto__") writeKey(out);
						const v = value[k];
						if (v instanceof NumericValue) out[k] = v;
						else out[k] = this._read(ns, v);
					}
					return out;
				} else return structuredClone(value);
			}
			return value;
		}
	};
	var JsonReplacer = class {
		values = /* @__PURE__ */ new Map();
		counter = 0;
		stage = 0;
		createReplacer() {
			if (this.stage === 1) throw new Error("@aws-sdk/core/protocols - JsonReplacer already created.");
			if (this.stage === 2) throw new Error("@aws-sdk/core/protocols - JsonReplacer exhausted.");
			this.stage = 1;
			return (key, value) => {
				if (value instanceof NumericValue) {
					const v = `${"Νnv" + this.counter++}_` + value.string;
					this.values.set(`"${v}"`, value.string);
					return v;
				}
				if (typeof value === "bigint") {
					const s = value.toString();
					const v = `${"Νb" + this.counter++}_` + s;
					this.values.set(`"${v}"`, s);
					return v;
				}
				return value;
			};
		}
		replaceInJson(json) {
			if (this.stage === 0) throw new Error("@aws-sdk/core/protocols - JsonReplacer not created yet.");
			if (this.stage === 2) throw new Error("@aws-sdk/core/protocols - JsonReplacer exhausted.");
			this.stage = 2;
			if (this.counter === 0) return json;
			for (const [key, value] of this.values) json = json.replace(key, value);
			return json;
		}
	};
	var JsonShapeSerializer = class extends SerdeContextConfig {
		settings;
		buffer;
		useReplacer = false;
		rootSchema;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		write(schema, value) {
			this.rootSchema = NormalizedSchema.of(schema);
			this.buffer = this._write(this.rootSchema, value);
		}
		flush() {
			const { rootSchema, useReplacer } = this;
			this.rootSchema = void 0;
			this.useReplacer = false;
			if (rootSchema?.isStructSchema() || rootSchema?.isDocumentSchema()) {
				if (!useReplacer) return JSON.stringify(this.buffer);
				const replacer = new JsonReplacer();
				return replacer.replaceInJson(JSON.stringify(this.buffer, replacer.createReplacer(), 0));
			}
			return this.buffer;
		}
		writeDiscriminatedDocument(schema, value) {
			this.write(schema, value);
			if (typeof this.buffer === "object") this.buffer.__type = NormalizedSchema.of(schema).getName(true);
		}
		_write(schema, value, container) {
			const isObject = value !== null && typeof value === "object";
			const ns = NormalizedSchema.of(schema);
			if (isObject) {
				if (ns.isStructSchema()) {
					const record = value;
					const out = {};
					const { jsonName } = this.settings;
					let nameMap = void 0;
					if (jsonName) nameMap = {};
					let outCount = 0;
					for (const [memberName, memberSchema] of ns.structIterator()) {
						const serializableValue = this._write(memberSchema, record[memberName], ns);
						if (serializableValue !== void 0) {
							let targetKey = memberName;
							if (jsonName) {
								targetKey = memberSchema.getMergedTraits().jsonName ?? memberName;
								nameMap[memberName] = targetKey;
							}
							out[targetKey] = serializableValue;
							outCount++;
						}
					}
					if (ns.isUnionSchema() && outCount === 0) {
						const { $unknown } = record;
						if (Array.isArray($unknown)) {
							const [k, v] = $unknown;
							if (k === "__proto__") writeKey(out);
							out[k] = this._write(15, v);
						}
					} else if (typeof record.__type === "string") for (const k in record) {
						const v = record[k];
						const targetKey = jsonName ? nameMap[k] ?? k : k;
						if (!(targetKey in out)) out[targetKey] = this._write(15, v);
					}
					return out;
				}
				if (Array.isArray(value) && ns.isListSchema()) {
					const listMember = ns.getValueSchema();
					const out = [];
					const sparse = !!ns.getMergedTraits().sparse;
					for (const item of value) if (sparse || item != null) out.push(this._write(listMember, item));
					return out;
				}
				if (ns.isMapSchema()) {
					const mapMember = ns.getValueSchema();
					const out = {};
					const sparse = !!ns.getMergedTraits().sparse;
					for (const _k in value) {
						const _v = value[_k];
						if (sparse || _v != null) {
							if (_k === "__proto__") writeKey(out);
							out[_k] = this._write(mapMember, _v);
						}
					}
					return out;
				}
				if (value instanceof Uint8Array && ns.isBlobSchema()) {
					if (ns === this.rootSchema) return value;
					return (this.serdeContext?.base64Encoder ?? toBase64)(value);
				}
				if (value instanceof Date && (ns.isTimestampSchema() || ns.isDocumentSchema())) switch (determineTimestampFormat(ns, this.settings)) {
					case 5: return value.toISOString().replace(".000Z", "Z");
					case 6: return dateToUtcString(value);
					case 7: return value.getTime() / 1e3;
					default:
						console.warn("Missing timestamp format, using epoch seconds", value);
						return value.getTime() / 1e3;
				}
				if (value instanceof NumericValue) this.useReplacer = true;
			}
			if (value === null && container?.isStructSchema()) return;
			if (ns.isStringSchema()) {
				if (typeof value === "undefined" && ns.isIdempotencyToken()) return generateIdempotencyToken();
				const mediaType = ns.getMergedTraits().mediaType;
				if (value != null && mediaType) {
					if (mediaType === "application/json" || mediaType.endsWith("+json")) return LazyJsonString.from(value);
				}
				return value;
			}
			if (typeof value === "number") {
				if (Math.abs(value) === Infinity || isNaN(value)) return String(value);
				return value;
			}
			if (typeof value === "string" && ns.isBlobSchema()) {
				if (ns === this.rootSchema) return value;
				return (this.serdeContext?.base64Encoder ?? toBase64)(value);
			}
			if (typeof value === "bigint") this.useReplacer = true;
			if (ns.isDocumentSchema()) {
				if (isObject) {
					if (value instanceof Uint8Array) return (this.serdeContext?.base64Encoder ?? toBase64)(value);
					const out = Array.isArray(value) ? [] : {};
					for (const k in value) {
						const v = value[k];
						if (k === "__proto__") writeKey(out);
						if (v instanceof NumericValue) {
							this.useReplacer = true;
							out[k] = v;
						} else out[k] = this._write(ns, v);
					}
					return out;
				} else return structuredClone(value);
			}
			return value;
		}
	};
	var JsonCodec = class extends SerdeContextConfig {
		settings;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		createSerializer() {
			const serializer = new JsonShapeSerializer(this.settings);
			serializer.setSerdeContext(this.serdeContext);
			return serializer;
		}
		createDeserializer() {
			const deserializer = new JsonShapeDeserializer(this.settings);
			deserializer.setSerdeContext(this.serdeContext);
			return deserializer;
		}
	};
	var XmlShapeDeserializer = class extends SerdeContextConfig {
		settings;
		stringDeserializer;
		constructor(settings) {
			super();
			this.settings = settings;
			this.stringDeserializer = new FromStringShapeDeserializer(settings);
		}
		setSerdeContext(serdeContext) {
			this.serdeContext = serdeContext;
			this.stringDeserializer.setSerdeContext(serdeContext);
		}
		read(schema, bytes, key) {
			const ns = NormalizedSchema.of(schema);
			const memberSchemas = ns.getMemberSchemas();
			if (ns.isStructSchema() && ns.isMemberSchema() && !!Object.values(memberSchemas).find((memberNs) => {
				return !!memberNs.getMemberTraits().eventPayload;
			})) {
				const output = {};
				const memberName = Object.keys(memberSchemas)[0];
				if (memberSchemas[memberName].isBlobSchema()) output[memberName] = bytes;
				else output[memberName] = this.read(memberSchemas[memberName], bytes);
				return output;
			}
			const xmlString = (this.serdeContext?.utf8Encoder ?? toUtf8)(bytes);
			const parsedObject = this.parseXml(xmlString);
			return this.readSchema(schema, key ? parsedObject[key] : parsedObject);
		}
		readSchema(_schema, value) {
			const ns = NormalizedSchema.of(_schema);
			if (ns.isUnitSchema()) return;
			const traits = ns.getMergedTraits();
			if (ns.isListSchema() && !Array.isArray(value)) return this.readSchema(ns, [value]);
			if (value == null) return value;
			if (typeof value === "object") {
				const flat = !!traits.xmlFlattened;
				if (ns.isListSchema()) {
					const listValue = ns.getValueSchema();
					const buffer = [];
					const sourceKey = listValue.getMergedTraits().xmlName ?? "member";
					const source = flat ? value : (value[0] ?? value)[sourceKey];
					if (source == null) return buffer;
					const sourceArray = Array.isArray(source) ? source : [source];
					for (const v of sourceArray) buffer.push(this.readSchema(listValue, v));
					return buffer;
				}
				const buffer = {};
				if (ns.isMapSchema()) {
					const keyNs = ns.getKeySchema();
					const memberNs = ns.getValueSchema();
					let entries;
					if (flat) entries = Array.isArray(value) ? value : [value];
					else entries = Array.isArray(value.entry) ? value.entry : [value.entry];
					const keyProperty = keyNs.getMergedTraits().xmlName ?? "key";
					const valueProperty = memberNs.getMergedTraits().xmlName ?? "value";
					for (const entry of entries) {
						const key = entry[keyProperty];
						const value = entry[valueProperty];
						if (key === "__proto__") writeKey(buffer);
						buffer[key] = this.readSchema(memberNs, value);
					}
					return buffer;
				}
				if (ns.isStructSchema()) {
					const union = ns.isUnionSchema();
					let unionSerde;
					if (union) unionSerde = new UnionSerde(value, buffer);
					for (const [memberName, memberSchema] of ns.structIterator()) {
						const memberTraits = memberSchema.getMergedTraits();
						const xmlObjectKey = !memberTraits.httpPayload ? memberSchema.getMemberTraits().xmlName ?? memberName : memberTraits.xmlName ?? memberSchema.getName();
						if (union) unionSerde.mark(xmlObjectKey);
						if (value[xmlObjectKey] != null) buffer[memberName] = this.readSchema(memberSchema, value[xmlObjectKey]);
					}
					if (union) unionSerde.writeUnknown();
					return buffer;
				}
				if (ns.isDocumentSchema()) return value;
				throw new Error(`@aws-sdk/core/protocols - xml deserializer unhandled schema type for ${ns.getName(true)}`);
			}
			if (ns.isListSchema()) return [];
			if (ns.isMapSchema() || ns.isStructSchema()) return {};
			return this.stringDeserializer.read(ns, value);
		}
		parseXml(xml) {
			if (xml.length) {
				let parsedObj;
				try {
					parsedObj = parseXML(xml);
				} catch (e) {
					if (e && typeof e === "object") Object.defineProperty(e, "$responseBodyText", { value: xml });
					throw e;
				}
				const textNodeName = "#text";
				const key = Object.keys(parsedObj)[0];
				const parsedObjToReturn = parsedObj[key];
				if (parsedObjToReturn[textNodeName]) {
					parsedObjToReturn[key] = parsedObjToReturn[textNodeName];
					delete parsedObjToReturn[textNodeName];
				}
				return getValueFromTextNode(parsedObjToReturn);
			}
			return {};
		}
	};
	var QueryShapeSerializer = class extends SerdeContextConfig {
		settings;
		buffer;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		write(schema, value, prefix = "") {
			if (this.buffer === void 0) this.buffer = "";
			const ns = NormalizedSchema.of(schema);
			if (prefix && !prefix.endsWith(".")) prefix += ".";
			if (ns.isBlobSchema()) {
				if (typeof value === "string" || value instanceof Uint8Array) {
					this.writeKey(prefix);
					this.writeValue((this.serdeContext?.base64Encoder ?? toBase64)(value));
				}
			} else if (ns.isBooleanSchema() || ns.isNumericSchema() || ns.isStringSchema()) {
				if (value != null) {
					this.writeKey(prefix);
					this.writeValue(String(value));
				} else if (ns.isIdempotencyToken()) {
					this.writeKey(prefix);
					this.writeValue(generateIdempotencyToken());
				}
			} else if (ns.isBigIntegerSchema()) {
				if (value != null) {
					this.writeKey(prefix);
					this.writeValue(String(value));
				}
			} else if (ns.isBigDecimalSchema()) {
				if (value != null) {
					this.writeKey(prefix);
					this.writeValue(value instanceof NumericValue ? value.string : String(value));
				}
			} else if (ns.isTimestampSchema()) {
				if (value instanceof Date) {
					this.writeKey(prefix);
					switch (determineTimestampFormat(ns, this.settings)) {
						case 5:
							this.writeValue(value.toISOString().replace(".000Z", "Z"));
							break;
						case 6:
							this.writeValue(dateToUtcString(value));
							break;
						case 7: this.writeValue(String(value.getTime() / 1e3));
					}
				}
			} else if (ns.isDocumentSchema()) {
				if (Array.isArray(value)) this.write(79, value, prefix);
				else if (value instanceof Date) this.write(4, value, prefix);
				else if (value instanceof Uint8Array) this.write(21, value, prefix);
				else if (value && typeof value === "object") this.write(143, value, prefix);
				else {
					this.writeKey(prefix);
					this.writeValue(String(value));
				}
			} else if (ns.isListSchema()) {
				if (Array.isArray(value)) {
					if (value.length === 0) {
						if (this.settings.serializeEmptyLists) {
							this.writeKey(prefix);
							this.writeValue("");
						}
					} else {
						const member = ns.getValueSchema();
						const flat = this.settings.flattenLists || ns.getMergedTraits().xmlFlattened;
						let i = 1;
						for (const item of value) {
							if (item == null) continue;
							const traits = member.getMergedTraits();
							const suffix = this.getKey("member", traits.xmlName, traits.ec2QueryName);
							const key = flat ? `${prefix}${i}` : `${prefix}${suffix}.${i}`;
							this.write(member, item, key);
							++i;
						}
					}
				}
			} else if (ns.isMapSchema()) {
				if (value && typeof value === "object") {
					const keySchema = ns.getKeySchema();
					const memberSchema = ns.getValueSchema();
					const flat = ns.getMergedTraits().xmlFlattened;
					let i = 1;
					for (const k in value) {
						const v = value[k];
						if (v == null) continue;
						const keyTraits = keySchema.getMergedTraits();
						const keySuffix = this.getKey("key", keyTraits.xmlName, keyTraits.ec2QueryName);
						const key = flat ? `${prefix}${i}.${keySuffix}` : `${prefix}entry.${i}.${keySuffix}`;
						const valTraits = memberSchema.getMergedTraits();
						const valueSuffix = this.getKey("value", valTraits.xmlName, valTraits.ec2QueryName);
						const valueKey = flat ? `${prefix}${i}.${valueSuffix}` : `${prefix}entry.${i}.${valueSuffix}`;
						this.write(keySchema, k, key);
						this.write(memberSchema, v, valueKey);
						++i;
					}
				}
			} else if (ns.isStructSchema()) {
				if (value && typeof value === "object") {
					let didWriteMember = false;
					for (const [memberName, member] of ns.structIterator()) {
						if (value[memberName] == null && !member.isIdempotencyToken()) continue;
						const traits = member.getMergedTraits();
						const suffix = this.getKey(memberName, traits.xmlName, traits.ec2QueryName, "struct");
						const key = `${prefix}${suffix}`;
						this.write(member, value[memberName], key);
						didWriteMember = true;
					}
					if (!didWriteMember && ns.isUnionSchema()) {
						const { $unknown } = value;
						if (Array.isArray($unknown)) {
							const [k, v] = $unknown;
							const key = `${prefix}${k}`;
							this.write(15, v, key);
						}
					}
				}
			} else if (ns.isUnitSchema());
			else throw new Error(`@aws-sdk/core/protocols - QuerySerializer unrecognized schema type ${ns.getName(true)}`);
		}
		flush() {
			if (this.buffer === void 0) throw new Error("@aws-sdk/core/protocols - QuerySerializer cannot flush with nothing written to buffer.");
			const str = this.buffer;
			delete this.buffer;
			return str;
		}
		getKey(memberName, xmlName, ec2QueryName, keySource) {
			const { ec2, capitalizeKeys } = this.settings;
			if (ec2 && ec2QueryName) return ec2QueryName;
			const key = xmlName ?? memberName;
			if (capitalizeKeys && keySource === "struct") return key[0].toUpperCase() + key.slice(1);
			return key;
		}
		writeKey(key) {
			if (key.endsWith(".")) key = key.slice(0, key.length - 1);
			this.buffer += `&${extendedEncodeURIComponent(key)}=`;
		}
		writeValue(value) {
			this.buffer += extendedEncodeURIComponent(value);
		}
	};
	var AwsQueryProtocol = class extends RpcProtocol {
		options;
		serializer;
		deserializer;
		mixin = new ProtocolLib();
		constructor(options) {
			super({
				defaultNamespace: options.defaultNamespace,
				errorTypeRegistries: options.errorTypeRegistries
			});
			this.options = options;
			const settings = {
				timestampFormat: {
					useTrait: true,
					default: 5
				},
				httpBindings: false,
				xmlNamespace: options.xmlNamespace,
				serviceNamespace: options.defaultNamespace,
				serializeEmptyLists: true
			};
			this.serializer = new QueryShapeSerializer(settings);
			this.deserializer = new XmlShapeDeserializer(settings);
		}
		getShapeId() {
			return "aws.protocols#awsQuery";
		}
		setSerdeContext(serdeContext) {
			this.serializer.setSerdeContext(serdeContext);
			this.deserializer.setSerdeContext(serdeContext);
		}
		getPayloadCodec() {
			throw new Error("AWSQuery protocol has no payload codec.");
		}
		async serializeRequest(operationSchema, input, context) {
			const request = await super.serializeRequest(operationSchema, input, context);
			if (!request.path.endsWith("/")) request.path += "/";
			request.headers["content-type"] = "application/x-www-form-urlencoded";
			if (deref(operationSchema.input) === "unit" || !request.body) request.body = "";
			request.body = `Action=${operationSchema.name.split("#")[1] ?? operationSchema.name}&Version=${this.options.version}` + request.body;
			if (request.body.endsWith("&")) request.body = request.body.slice(-1);
			return request;
		}
		async deserializeResponse(operationSchema, context, response) {
			const deserializer = this.deserializer;
			const ns = NormalizedSchema.of(operationSchema.output);
			const dataObject = {};
			if (response.statusCode >= 300) {
				const bytes = await collectBody(response.body, context);
				if (bytes.byteLength > 0) Object.assign(dataObject, await deserializer.read(15, bytes));
				await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
			}
			for (const header in response.headers) {
				const value = response.headers[header];
				delete response.headers[header];
				response.headers[header.toLowerCase()] = value;
			}
			const shortName = operationSchema.name.split("#")[1] ?? operationSchema.name;
			const awsQueryResultKey = ns.isStructSchema() && this.useNestedResult() ? shortName + "Result" : void 0;
			const bytes = await collectBody(response.body, context);
			if (bytes.byteLength > 0) Object.assign(dataObject, await deserializer.read(ns, bytes, awsQueryResultKey));
			dataObject.$metadata = this.deserializeMetadata(response);
			return dataObject;
		}
		useNestedResult() {
			return true;
		}
		async handleError(operationSchema, context, response, dataObject, metadata) {
			const errorIdentifier = this.loadQueryErrorCode(response, dataObject) ?? "Unknown";
			this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
			const errorData = this.loadQueryError(dataObject) ?? {};
			const message = this.loadQueryErrorMessage(dataObject);
			errorData.message = message;
			errorData.Error = {
				Type: errorData.Type,
				Code: errorData.Code,
				Message: message
			};
			const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, errorData, metadata, this.mixin.findQueryCompatibleError);
			const ns = NormalizedSchema.of(errorSchema);
			const exception = new ((this.compositeErrorRegistry.getErrorCtor(errorSchema)) ?? Error)({});
			const output = {
				Type: errorData.Error.Type,
				Code: errorData.Error.Code,
				Error: errorData.Error
			};
			for (const [name, member] of ns.structIterator()) {
				const target = member.getMergedTraits().xmlName ?? name;
				const value = errorData[target] ?? dataObject[target];
				output[name] = this.deserializer.readSchema(member, value);
			}
			throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
				$fault: ns.getMergedTraits().error,
				message
			}, output), dataObject);
		}
		loadQueryErrorCode(output, data) {
			const code = (data.Errors?.[0]?.Error ?? data.Errors?.Error ?? data.Error)?.Code;
			if (code !== void 0) return code;
			if (output.statusCode == 404) return "NotFound";
		}
		loadQueryError(data) {
			return data.Errors?.[0]?.Error ?? data.Errors?.Error ?? data.Error;
		}
		loadQueryErrorMessage(data) {
			const errorData = this.loadQueryError(data);
			return errorData?.message ?? errorData?.Message ?? data.message ?? data.Message ?? "Unknown";
		}
		getDefaultContentType() {
			return "application/x-www-form-urlencoded";
		}
	};
	var AwsEc2QueryProtocol = class extends AwsQueryProtocol {
		options;
		constructor(options) {
			super(options);
			this.options = options;
			Object.assign(this.serializer.settings, {
				capitalizeKeys: true,
				flattenLists: true,
				serializeEmptyLists: false,
				ec2: true
			});
		}
		getShapeId() {
			return "aws.protocols#ec2Query";
		}
		useNestedResult() {
			return false;
		}
	};
	var parseXmlBody = (streamBody, context) => collectBodyString(streamBody, context).then((encoded) => {
		if (encoded.length) {
			let parsedObj;
			try {
				parsedObj = parseXML(encoded);
			} catch (e) {
				if (e && typeof e === "object") Object.defineProperty(e, "$responseBodyText", { value: encoded });
				throw e;
			}
			const textNodeName = "#text";
			const key = Object.keys(parsedObj)[0];
			const parsedObjToReturn = parsedObj[key];
			if (parsedObjToReturn[textNodeName]) {
				parsedObjToReturn[key] = parsedObjToReturn[textNodeName];
				delete parsedObjToReturn[textNodeName];
			}
			return getValueFromTextNode(parsedObjToReturn);
		}
		return {};
	});
	var parseXmlErrorBody = async (errorBody, context) => {
		const value = await parseXmlBody(errorBody, context);
		if (value.Error) value.Error.message = value.Error.message ?? value.Error.Message;
		return value;
	};
	var loadRestXmlErrorCode = (output, data) => {
		if (data?.Error?.Code !== void 0) return data.Error.Code;
		if (data?.Code !== void 0) return data.Code;
		if (output.statusCode == 404) return "NotFound";
	};
	var XmlShapeSerializer = class extends SerdeContextConfig {
		settings;
		stringBuffer;
		byteBuffer;
		buffer;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		write(schema, value) {
			const ns = NormalizedSchema.of(schema);
			if (ns.isStringSchema() && typeof value === "string") this.stringBuffer = value;
			else if (ns.isBlobSchema()) this.byteBuffer = "byteLength" in value ? value : (this.serdeContext?.base64Decoder ?? fromBase64)(value);
			else {
				this.buffer = this.writeStruct(ns, value, void 0);
				const traits = ns.getMergedTraits();
				if (traits.httpPayload && !traits.xmlName) this.buffer.withName(ns.getName());
			}
		}
		flush() {
			if (this.byteBuffer !== void 0) {
				const bytes = this.byteBuffer;
				delete this.byteBuffer;
				return bytes;
			}
			if (this.stringBuffer !== void 0) {
				const str = this.stringBuffer;
				delete this.stringBuffer;
				return str;
			}
			const buffer = this.buffer;
			if (this.settings.xmlNamespace) {
				if (!buffer?.attributes?.["xmlns"]) buffer.addAttribute("xmlns", this.settings.xmlNamespace);
			}
			delete this.buffer;
			return buffer.toString();
		}
		writeStruct(ns, value, parentXmlns) {
			const traits = ns.getMergedTraits();
			const name = ns.isMemberSchema() && !traits.httpPayload ? ns.getMemberTraits().xmlName ?? ns.getMemberName() : traits.xmlName ?? ns.getName();
			if (!name || !ns.isStructSchema()) throw new Error(`@aws-sdk/core/protocols - xml serializer, cannot write struct with empty name or non-struct, schema=${ns.getName(true)}.`);
			const structXmlNode = XmlNode.of(name);
			const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(ns, parentXmlns);
			for (const [memberName, memberSchema] of ns.structIterator()) {
				const val = value[memberName];
				if (val != null || memberSchema.isIdempotencyToken()) {
					if (memberSchema.getMergedTraits().xmlAttribute) {
						structXmlNode.addAttribute(memberSchema.getMergedTraits().xmlName ?? memberName, this.writeSimple(memberSchema, val));
						continue;
					}
					if (memberSchema.isListSchema()) this.writeList(memberSchema, val, structXmlNode, xmlns);
					else if (memberSchema.isMapSchema()) this.writeMap(memberSchema, val, structXmlNode, xmlns);
					else if (memberSchema.isStructSchema()) structXmlNode.addChildNode(this.writeStruct(memberSchema, val, xmlns));
					else {
						const memberNode = XmlNode.of(memberSchema.getMergedTraits().xmlName ?? memberSchema.getMemberName());
						this.writeSimpleInto(memberSchema, val, memberNode, xmlns);
						structXmlNode.addChildNode(memberNode);
					}
				}
			}
			const { $unknown } = value;
			if ($unknown && ns.isUnionSchema() && Array.isArray($unknown) && Object.keys(value).length === 1) {
				const [k, v] = $unknown;
				const node = XmlNode.of(k);
				if (typeof v !== "string") {
					if (value instanceof XmlNode || value instanceof XmlText) structXmlNode.addChildNode(value);
					else throw new Error("@aws-sdk - $unknown union member in XML requires value of type string, @aws-sdk/xml-builder::XmlNode or XmlText.");
				}
				this.writeSimpleInto(0, v, node, xmlns);
				structXmlNode.addChildNode(node);
			}
			if (xmlns) structXmlNode.addAttribute(xmlnsAttr, xmlns);
			return structXmlNode;
		}
		writeList(listMember, array, container, parentXmlns) {
			if (!listMember.isMemberSchema()) throw new Error(`@aws-sdk/core/protocols - xml serializer, cannot write non-member list: ${listMember.getName(true)}`);
			const listTraits = listMember.getMergedTraits();
			const listValueSchema = listMember.getValueSchema();
			const listValueTraits = listValueSchema.getMergedTraits();
			const sparse = !!listValueTraits.sparse;
			const flat = !!listTraits.xmlFlattened;
			const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(listMember, parentXmlns);
			const writeItem = (container, value) => {
				if (listValueSchema.isListSchema()) this.writeList(listValueSchema, Array.isArray(value) ? value : [value], container, xmlns);
				else if (listValueSchema.isMapSchema()) this.writeMap(listValueSchema, value, container, xmlns);
				else if (listValueSchema.isStructSchema()) {
					const struct = this.writeStruct(listValueSchema, value, xmlns);
					container.addChildNode(struct.withName(flat ? listTraits.xmlName ?? listMember.getMemberName() : listValueTraits.xmlName ?? "member"));
				} else {
					const listItemNode = XmlNode.of(flat ? listTraits.xmlName ?? listMember.getMemberName() : listValueTraits.xmlName ?? "member");
					this.writeSimpleInto(listValueSchema, value, listItemNode, xmlns);
					container.addChildNode(listItemNode);
				}
			};
			if (flat) {
				for (const value of array) if (sparse || value != null) writeItem(container, value);
			} else {
				const listNode = XmlNode.of(listTraits.xmlName ?? listMember.getMemberName());
				if (xmlns) listNode.addAttribute(xmlnsAttr, xmlns);
				for (const value of array) if (sparse || value != null) writeItem(listNode, value);
				container.addChildNode(listNode);
			}
		}
		writeMap(mapMember, map, container, parentXmlns, containerIsMap = false) {
			if (!mapMember.isMemberSchema()) throw new Error(`@aws-sdk/core/protocols - xml serializer, cannot write non-member map: ${mapMember.getName(true)}`);
			const mapTraits = mapMember.getMergedTraits();
			const mapKeySchema = mapMember.getKeySchema();
			const keyTag = mapKeySchema.getMergedTraits().xmlName ?? "key";
			const mapValueSchema = mapMember.getValueSchema();
			const mapValueTraits = mapValueSchema.getMergedTraits();
			const valueTag = mapValueTraits.xmlName ?? "value";
			const sparse = !!mapValueTraits.sparse;
			const flat = !!mapTraits.xmlFlattened;
			const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(mapMember, parentXmlns);
			const addKeyValue = (entry, key, val) => {
				const keyNode = XmlNode.of(keyTag, key);
				const [keyXmlnsAttr, keyXmlns] = this.getXmlnsAttribute(mapKeySchema, xmlns);
				if (keyXmlns) keyNode.addAttribute(keyXmlnsAttr, keyXmlns);
				entry.addChildNode(keyNode);
				let valueNode = XmlNode.of(valueTag);
				if (mapValueSchema.isListSchema()) this.writeList(mapValueSchema, val, valueNode, xmlns);
				else if (mapValueSchema.isMapSchema()) this.writeMap(mapValueSchema, val, valueNode, xmlns, true);
				else if (mapValueSchema.isStructSchema()) valueNode = this.writeStruct(mapValueSchema, val, xmlns);
				else this.writeSimpleInto(mapValueSchema, val, valueNode, xmlns);
				entry.addChildNode(valueNode);
			};
			if (flat) for (const key in map) {
				const val = map[key];
				if (sparse || val != null) {
					const entry = XmlNode.of(mapTraits.xmlName ?? mapMember.getMemberName());
					addKeyValue(entry, key, val);
					container.addChildNode(entry);
				}
			}
			else {
				let mapNode;
				if (!containerIsMap) {
					mapNode = XmlNode.of(mapTraits.xmlName ?? mapMember.getMemberName());
					if (xmlns) mapNode.addAttribute(xmlnsAttr, xmlns);
					container.addChildNode(mapNode);
				}
				for (const key in map) {
					const val = map[key];
					if (sparse || val != null) {
						const entry = XmlNode.of("entry");
						addKeyValue(entry, key, val);
						(containerIsMap ? container : mapNode).addChildNode(entry);
					}
				}
			}
		}
		writeSimple(_schema, value) {
			if (null === value) throw new Error("@aws-sdk/core/protocols - (XML serializer) cannot write null value.");
			const ns = NormalizedSchema.of(_schema);
			let nodeContents = null;
			if (value && typeof value === "object") {
				if (ns.isBlobSchema()) nodeContents = (this.serdeContext?.base64Encoder ?? toBase64)(value);
				else if (ns.isTimestampSchema() && value instanceof Date) switch (determineTimestampFormat(ns, this.settings)) {
					case 5:
						nodeContents = value.toISOString().replace(".000Z", "Z");
						break;
					case 6:
						nodeContents = dateToUtcString(value);
						break;
					case 7:
						nodeContents = String(value.getTime() / 1e3);
						break;
					default:
						console.warn("Missing timestamp format, using http date", value);
						nodeContents = dateToUtcString(value);
				}
				else if (ns.isBigDecimalSchema() && value) {
					if (value instanceof NumericValue) return value.string;
					return String(value);
				} else if (ns.isMapSchema() || ns.isListSchema()) throw new Error("@aws-sdk/core/protocols - xml serializer, cannot call _write() on List/Map schema, call writeList or writeMap() instead.");
				else throw new Error(`@aws-sdk/core/protocols - xml serializer, unhandled schema type for object value and schema: ${ns.getName(true)}`);
			}
			if (ns.isBooleanSchema() || ns.isNumericSchema() || ns.isBigIntegerSchema() || ns.isBigDecimalSchema()) nodeContents = String(value);
			if (ns.isStringSchema()) {
				if (value === void 0 && ns.isIdempotencyToken()) nodeContents = generateIdempotencyToken();
				else nodeContents = String(value);
			}
			if (nodeContents === null) throw new Error(`Unhandled schema-value pair ${ns.getName(true)}=${value}`);
			return nodeContents;
		}
		writeSimpleInto(_schema, value, into, parentXmlns) {
			const nodeContents = this.writeSimple(_schema, value);
			const ns = NormalizedSchema.of(_schema);
			const content = new XmlText(nodeContents);
			const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(ns, parentXmlns);
			if (xmlns) into.addAttribute(xmlnsAttr, xmlns);
			into.addChildNode(content);
		}
		getXmlnsAttribute(ns, parentXmlns) {
			const [prefix, xmlns] = ns.getMergedTraits().xmlNamespace ?? [];
			if (xmlns && xmlns !== parentXmlns) return [prefix ? `xmlns:${prefix}` : "xmlns", xmlns];
			return [void 0, void 0];
		}
	};
	var XmlCodec = class extends SerdeContextConfig {
		settings;
		constructor(settings) {
			super();
			this.settings = settings;
		}
		createSerializer() {
			const serializer = new XmlShapeSerializer(this.settings);
			serializer.setSerdeContext(this.serdeContext);
			return serializer;
		}
		createDeserializer() {
			const deserializer = new XmlShapeDeserializer(this.settings);
			deserializer.setSerdeContext(this.serdeContext);
			return deserializer;
		}
	};
	var AwsRestXmlProtocol = class extends HttpBindingProtocol {
		codec;
		serializer;
		deserializer;
		mixin = new ProtocolLib();
		constructor(options) {
			super(options);
			const settings = {
				timestampFormat: {
					useTrait: true,
					default: 5
				},
				httpBindings: true,
				xmlNamespace: options.xmlNamespace,
				serviceNamespace: options.defaultNamespace
			};
			this.codec = new XmlCodec(settings);
			this.serializer = new HttpInterceptingShapeSerializer(this.codec.createSerializer(), settings);
			this.deserializer = new HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), settings);
		}
		getPayloadCodec() {
			return this.codec;
		}
		getShapeId() {
			return "aws.protocols#restXml";
		}
		async serializeRequest(operationSchema, input, context) {
			const request = await super.serializeRequest(operationSchema, input, context);
			const inputSchema = NormalizedSchema.of(operationSchema.input);
			if (!request.headers["content-type"]) {
				const contentType = this.mixin.resolveRestContentType(this.getDefaultContentType(), inputSchema);
				if (contentType) request.headers["content-type"] = contentType;
			}
			if (typeof request.body === "string" && request.headers["content-type"] === this.getDefaultContentType() && !request.body.startsWith("<?xml ") && !this.hasUnstructuredPayloadBinding(inputSchema)) request.body = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + request.body;
			return request;
		}
		async deserializeResponse(operationSchema, context, response) {
			return super.deserializeResponse(operationSchema, context, response);
		}
		async handleError(operationSchema, context, response, dataObject, metadata) {
			const errorIdentifier = loadRestXmlErrorCode(response, dataObject) ?? "Unknown";
			this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
			if (dataObject.Error && typeof dataObject.Error === "object") for (const key of Object.keys(dataObject.Error)) {
				dataObject[key] = dataObject.Error[key];
				if (key.toLowerCase() === "message") dataObject.message = dataObject.Error[key];
			}
			if (dataObject.RequestId && !metadata.requestId) metadata.requestId = dataObject.RequestId;
			const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, dataObject, metadata);
			const ns = NormalizedSchema.of(errorSchema);
			const message = dataObject.Error?.message ?? dataObject.Error?.Message ?? dataObject.message ?? dataObject.Message ?? "UnknownError";
			const exception = new ((this.compositeErrorRegistry.getErrorCtor(errorSchema)) ?? Error)({});
			await this.deserializeHttpMessage(errorSchema, context, response, dataObject);
			const output = {};
			const errorDeserializer = this.codec.createDeserializer();
			for (const [name, member] of ns.structIterator()) {
				const target = member.getMergedTraits().xmlName ?? name;
				const value = dataObject.Error?.[target] ?? dataObject[target];
				output[name] = errorDeserializer.readSchema(member, value);
			}
			throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
				$fault: ns.getMergedTraits().error,
				message
			}, output), dataObject);
		}
		getDefaultContentType() {
			return "application/xml";
		}
		hasUnstructuredPayloadBinding(ns) {
			for (const [, member] of ns.structIterator()) if (member.getMergedTraits().httpPayload) return !(member.isStructSchema() || member.isMapSchema() || member.isListSchema());
			return false;
		}
	};
	var awsExpectUnion = (value) => {
		if (value == null) return;
		if (typeof value === "object" && "__type" in value) delete value.__type;
		return expectUnion(value);
	};
	var _toStr = (val) => {
		if (val == null) return val;
		if (typeof val === "number" || typeof val === "bigint") {
			const warning = /* @__PURE__ */ new Error(`Received number ${val} where a string was expected.`);
			warning.name = "Warning";
			console.warn(warning);
			return String(val);
		}
		if (typeof val === "boolean") {
			const warning = /* @__PURE__ */ new Error(`Received boolean ${val} where a string was expected.`);
			warning.name = "Warning";
			console.warn(warning);
			return String(val);
		}
		return val;
	};
	var _toBool = (val) => {
		if (val == null) return val;
		if (typeof val === "string") {
			const lowercase = val.toLowerCase();
			if (val !== "" && lowercase !== "false" && lowercase !== "true") {
				const warning = /* @__PURE__ */ new Error(`Received string "${val}" where a boolean was expected.`);
				warning.name = "Warning";
				console.warn(warning);
			}
			return val !== "" && lowercase !== "false";
		}
		return val;
	};
	var _toNum = (val) => {
		if (val == null) return val;
		if (typeof val === "string") {
			const num = Number(val);
			if (num.toString() !== val) {
				const warning = /* @__PURE__ */ new Error(`Received string "${val}" where a number was expected.`);
				warning.name = "Warning";
				console.warn(warning);
				return val;
			}
			return num;
		}
		return val;
	};
	exports.AwsEc2QueryProtocol = AwsEc2QueryProtocol;
	exports.AwsJson1_0Protocol = AwsJson1_0Protocol;
	exports.AwsJson1_1Protocol = AwsJson1_1Protocol;
	exports.AwsJsonRpcProtocol = AwsJsonRpcProtocol;
	exports.AwsQueryProtocol = AwsQueryProtocol;
	exports.AwsRestJsonProtocol = AwsRestJsonProtocol;
	exports.AwsRestXmlProtocol = AwsRestXmlProtocol;
	exports.AwsSmithyRpcV2CborProtocol = AwsSmithyRpcV2CborProtocol;
	exports.JsonCodec = JsonCodec;
	exports.JsonCodec2 = JsonCodec2;
	exports.JsonShapeDeserializer = JsonShapeDeserializer;
	exports.JsonShapeDeserializer2 = JsonShapeDeserializer2;
	exports.JsonShapeSerializer = JsonShapeSerializer;
	exports.JsonShapeSerializer2 = JsonShapeSerializer2;
	exports.QueryShapeSerializer = QueryShapeSerializer;
	exports.XmlCodec = XmlCodec;
	exports.XmlShapeDeserializer = XmlShapeDeserializer;
	exports.XmlShapeSerializer = XmlShapeSerializer;
	exports._toBool = _toBool;
	exports._toNum = _toNum;
	exports._toStr = _toStr;
	exports.awsExpectUnion = awsExpectUnion;
	exports.loadJsonRpcErrorCode = loadJsonRpcErrorCode;
	exports.loadRestJsonErrorCode = loadRestJsonErrorCode;
	exports.loadRestXmlErrorCode = loadRestXmlErrorCode;
	exports.parseJsonBody = parseJsonBody;
	exports.parseJsonErrorBody = parseJsonErrorBody;
	exports.parseXmlBody = parseXmlBody;
	exports.parseXmlErrorBody = parseXmlErrorBody;
}));
//#endregion
//#region node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/submodules/s3/index.js
var require_s3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var { NoOpLogger, getSmithyContext } = require_client();
	var { HttpRequest, HttpResponse } = require_protocols$1();
	var { setFeature } = require_client$1();
	var { parseRfc7231DateTime } = require_serde();
	var { SignatureV4SignWithCredentials } = (init_dist_es$2(), __toCommonJS(dist_es_exports$4));
	var { booleanSelector, SelectorType } = require_config();
	var { httpSigningMiddlewareOptions } = require_dist_cjs();
	var { Readable: Readable$1 } = __require("node:stream");
	var { validate, parse } = require_util();
	var { AwsRestXmlProtocol } = require_protocols();
	var { NormalizedSchema } = require_schema();
	var CONTENT_LENGTH_HEADER = "content-length";
	var DECODED_CONTENT_LENGTH_HEADER = "x-amz-decoded-content-length";
	function checkContentLengthHeader() {
		return (next, context) => async (args) => {
			const { request } = args;
			if (HttpRequest.isInstance(request)) {
				if (!(CONTENT_LENGTH_HEADER in request.headers) && !(DECODED_CONTENT_LENGTH_HEADER in request.headers)) {
					const message = `Are you using a Stream of unknown length as the Body of a PutObject request? Consider using Upload instead from @aws-sdk/lib-storage.`;
					if (typeof context?.logger?.warn === "function" && !(context.logger instanceof NoOpLogger)) context.logger.warn(message);
					else console.warn(message);
				}
			}
			return next({ ...args });
		};
	}
	var checkContentLengthHeaderMiddlewareOptions = {
		step: "finalizeRequest",
		tags: ["CHECK_CONTENT_LENGTH_HEADER"],
		name: "getCheckContentLengthHeaderPlugin",
		override: true
	};
	var getCheckContentLengthHeaderPlugin = (unused) => ({ applyToStack: (clientStack) => {
		clientStack.add(checkContentLengthHeader(), checkContentLengthHeaderMiddlewareOptions);
	} });
	var regionRedirectEndpointMiddleware = (config) => {
		return (next, context) => async (args) => {
			const originalRegion = await config.region();
			const regionProviderRef = config.region;
			let unlock = () => {};
			if (context.__s3RegionRedirect) {
				Object.defineProperty(config, "region", {
					writable: false,
					value: async () => {
						return context.__s3RegionRedirect;
					}
				});
				unlock = () => Object.defineProperty(config, "region", {
					writable: true,
					value: regionProviderRef
				});
			}
			try {
				const result = await next(args);
				if (context.__s3RegionRedirect) {
					unlock();
					if (originalRegion !== await config.region()) throw new Error("Region was not restored following S3 region redirect.");
				}
				return result;
			} catch (e) {
				unlock();
				throw e;
			}
		};
	};
	var regionRedirectEndpointMiddlewareOptions = {
		tags: ["REGION_REDIRECT", "S3"],
		name: "regionRedirectEndpointMiddleware",
		override: true,
		relation: "before",
		toMiddleware: "endpointV2Middleware"
	};
	function regionRedirectMiddleware(clientConfig) {
		return (next, context) => async (args) => {
			try {
				return await next(args);
			} catch (err) {
				if (clientConfig.followRegionRedirects) {
					const statusCode = err?.$metadata?.httpStatusCode;
					const isHeadBucket = context.commandName === "HeadBucketCommand";
					const bucketRegionHeader = err?.$response?.headers?.["x-amz-bucket-region"];
					if (bucketRegionHeader) {
						if (statusCode === 301 || statusCode === 400 && (err?.name === "IllegalLocationConstraintException" || isHeadBucket)) {
							try {
								const actualRegion = bucketRegionHeader;
								context.logger?.debug(`Redirecting from ${await clientConfig.region()} to ${actualRegion}`);
								context.__s3RegionRedirect = actualRegion;
								setFeature(context, "S3_REGION_REDIRECT", "Ah");
							} catch (e) {
								throw new Error("Region redirect failed: " + e);
							}
							return next(args);
						}
					}
				}
				throw err;
			}
		};
	}
	var regionRedirectMiddlewareOptions = {
		step: "initialize",
		tags: ["REGION_REDIRECT", "S3"],
		name: "regionRedirectMiddleware",
		override: true
	};
	var getRegionRedirectMiddlewarePlugin = (clientConfig) => ({ applyToStack: (clientStack) => {
		clientStack.add(regionRedirectMiddleware(clientConfig), regionRedirectMiddlewareOptions);
		clientStack.addRelativeTo(regionRedirectEndpointMiddleware(clientConfig), regionRedirectEndpointMiddlewareOptions);
	} });
	var S3ExpressIdentityCache = class S3ExpressIdentityCache {
		data;
		lastPurgeTime = Date.now();
		static EXPIRED_CREDENTIAL_PURGE_INTERVAL_MS = 3e4;
		constructor(data = {}) {
			this.data = data;
		}
		get(key) {
			const entry = this.data[key];
			if (!entry) return;
			return entry;
		}
		set(key, entry) {
			this.data[key] = entry;
			return entry;
		}
		delete(key) {
			delete this.data[key];
		}
		async purgeExpired() {
			const now = Date.now();
			if (this.lastPurgeTime + S3ExpressIdentityCache.EXPIRED_CREDENTIAL_PURGE_INTERVAL_MS > now) return;
			for (const key in this.data) {
				const entry = this.data[key];
				if (!entry.isRefreshing) {
					const credential = await entry.identity;
					if (credential.expiration) {
						if (credential.expiration.getTime() < now) delete this.data[key];
					}
				}
			}
		}
	};
	var S3ExpressIdentityCacheEntry = class {
		_identity;
		isRefreshing;
		accessed;
		constructor(_identity, isRefreshing = false, accessed = Date.now()) {
			this._identity = _identity;
			this.isRefreshing = isRefreshing;
			this.accessed = accessed;
		}
		get identity() {
			this.accessed = Date.now();
			return this._identity;
		}
	};
	var S3ExpressIdentityProviderImpl = class S3ExpressIdentityProviderImpl {
		createSessionFn;
		cache;
		static REFRESH_WINDOW_MS = 6e4;
		constructor(createSessionFn, cache = new S3ExpressIdentityCache()) {
			this.createSessionFn = createSessionFn;
			this.cache = cache;
		}
		async getS3ExpressIdentity(awsIdentity, identityProperties) {
			const key = identityProperties.Bucket;
			const { cache } = this;
			const entry = cache.get(key);
			if (entry) return entry.identity.then((identity) => {
				if ((identity.expiration?.getTime() ?? 0) < Date.now()) return cache.set(key, new S3ExpressIdentityCacheEntry(this.getIdentity(key))).identity;
				if ((identity.expiration?.getTime() ?? 0) < Date.now() + S3ExpressIdentityProviderImpl.REFRESH_WINDOW_MS && !entry.isRefreshing) {
					entry.isRefreshing = true;
					this.getIdentity(key).then((id) => {
						cache.set(key, new S3ExpressIdentityCacheEntry(Promise.resolve(id)));
					});
				}
				return identity;
			});
			return cache.set(key, new S3ExpressIdentityCacheEntry(this.getIdentity(key))).identity;
		}
		async getIdentity(key) {
			await this.cache.purgeExpired().catch((error) => {
				console.warn("Error while clearing expired entries in S3ExpressIdentityCache: \n" + error);
			});
			const session = await this.createSessionFn(key);
			if (!session.Credentials?.AccessKeyId || !session.Credentials?.SecretAccessKey) throw new Error("s3#createSession response credential missing AccessKeyId or SecretAccessKey.");
			return {
				accessKeyId: session.Credentials.AccessKeyId,
				secretAccessKey: session.Credentials.SecretAccessKey,
				sessionToken: session.Credentials.SessionToken,
				expiration: session.Credentials.Expiration ? new Date(session.Credentials.Expiration) : void 0
			};
		}
	};
	var resolveS3Config = (input, { session }) => {
		const [s3ClientProvider, CreateSessionCommandCtor] = session;
		const { forcePathStyle, useAccelerateEndpoint, disableMultiregionAccessPoints, followRegionRedirects, s3ExpressIdentityProvider, bucketEndpoint, expectContinueHeader } = input;
		return Object.assign(input, {
			forcePathStyle: forcePathStyle ?? false,
			useAccelerateEndpoint: useAccelerateEndpoint ?? false,
			disableMultiregionAccessPoints: disableMultiregionAccessPoints ?? false,
			followRegionRedirects: followRegionRedirects ?? false,
			s3ExpressIdentityProvider: s3ExpressIdentityProvider ?? new S3ExpressIdentityProviderImpl(async (key) => s3ClientProvider().send(new CreateSessionCommandCtor({ Bucket: key }))),
			bucketEndpoint: bucketEndpoint ?? false,
			expectContinueHeader: expectContinueHeader ?? 2097152
		});
	};
	var s3ExpiresMiddleware = (config) => {
		return (next, context) => async (args) => {
			const result = await next(args);
			const { response } = result;
			if (HttpResponse.isInstance(response)) {
				if (response.headers.expires) {
					response.headers.expiresstring = response.headers.expires;
					try {
						parseRfc7231DateTime(response.headers.expires);
					} catch (e) {
						context.logger?.warn(`AWS SDK Warning for ${context.clientName}::${context.commandName} response parsing (${response.headers.expires}): ${e}`);
						delete response.headers.expires;
					}
				}
			}
			return result;
		};
	};
	var s3ExpiresMiddlewareOptions = {
		tags: ["S3"],
		name: "s3ExpiresMiddleware",
		override: true,
		relation: "after",
		toMiddleware: "deserializerMiddleware"
	};
	var getS3ExpiresMiddlewarePlugin = (clientConfig) => ({ applyToStack: (clientStack) => {
		clientStack.addRelativeTo(s3ExpiresMiddleware(), s3ExpiresMiddlewareOptions);
	} });
	var S3_EXPRESS_BUCKET_TYPE = "Directory";
	var S3_EXPRESS_BACKEND = "S3Express";
	var S3_EXPRESS_AUTH_SCHEME = "sigv4-s3express";
	var SESSION_TOKEN_HEADER = "X-Amz-S3session-Token".toLowerCase();
	var NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_ENV_NAME = "AWS_S3_DISABLE_EXPRESS_SESSION_AUTH";
	var NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_INI_NAME = "s3_disable_express_session_auth";
	var NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_OPTIONS = {
		environmentVariableSelector: (env) => booleanSelector(env, NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_ENV_NAME, SelectorType.ENV),
		configFileSelector: (profile) => booleanSelector(profile, NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_INI_NAME, SelectorType.CONFIG),
		default: false
	};
	var s3ExpressMiddleware = (options) => {
		return (next, context) => async (args) => {
			if (context.endpointV2) {
				const endpoint = context.endpointV2;
				const isS3ExpressAuth = endpoint.properties?.authSchemes?.[0]?.name === S3_EXPRESS_AUTH_SCHEME;
				if (endpoint.properties?.backend === S3_EXPRESS_BACKEND || endpoint.properties?.bucketType === S3_EXPRESS_BUCKET_TYPE) {
					setFeature(context, "S3_EXPRESS_BUCKET", "J");
					context.isS3ExpressBucket = true;
				}
				if (isS3ExpressAuth) {
					const requestBucket = args.input.Bucket;
					if (requestBucket) {
						const s3ExpressIdentity = await options.s3ExpressIdentityProvider.getS3ExpressIdentity(await options.credentials(), { Bucket: requestBucket });
						context.s3ExpressIdentity = s3ExpressIdentity;
						if (HttpRequest.isInstance(args.request) && s3ExpressIdentity.sessionToken) args.request.headers[SESSION_TOKEN_HEADER] = s3ExpressIdentity.sessionToken;
					}
				}
			}
			return next(args);
		};
	};
	var s3ExpressMiddlewareOptions = {
		name: "s3ExpressMiddleware",
		step: "build",
		tags: ["S3", "S3_EXPRESS"],
		override: true
	};
	var getS3ExpressPlugin = (options) => ({ applyToStack: (clientStack) => {
		clientStack.add(s3ExpressMiddleware(options), s3ExpressMiddlewareOptions);
	} });
	var signS3Express = async (s3ExpressIdentity, signingOptions, request, sigV4MultiRegionSigner) => {
		const signedRequest = await sigV4MultiRegionSigner.signWithCredentials(request, s3ExpressIdentity, {});
		if (signedRequest.headers["X-Amz-Security-Token"] || signedRequest.headers["x-amz-security-token"]) throw new Error("X-Amz-Security-Token must not be set for s3-express requests.");
		return signedRequest;
	};
	var defaultErrorHandler = (signingProperties) => (error) => {
		throw error;
	};
	var defaultSuccessHandler = (httpResponse, signingProperties) => {};
	var s3ExpressHttpSigningMiddleware = (config) => (next, context) => async (args) => {
		if (!HttpRequest.isInstance(args.request)) return next(args);
		const scheme = getSmithyContext(context).selectedHttpAuthScheme;
		if (!scheme) throw new Error(`No HttpAuthScheme was selected: unable to sign request`);
		const { httpAuthOption: { signingProperties = {} }, identity, signer } = scheme;
		let request;
		if (context.s3ExpressIdentity) request = await signS3Express(context.s3ExpressIdentity, signingProperties, args.request, await config.signer());
		else request = await signer.sign(args.request, identity, signingProperties);
		const output = await next({
			...args,
			request
		}).catch((signer.errorHandler || defaultErrorHandler)(signingProperties));
		(signer.successHandler || defaultSuccessHandler)(output.response, signingProperties);
		return output;
	};
	var getS3ExpressHttpSigningPlugin = (config) => ({ applyToStack: (clientStack) => {
		clientStack.addRelativeTo(s3ExpressHttpSigningMiddleware(config), httpSigningMiddlewareOptions);
	} });
	function toStream(bytes) {
		return Readable$1.from(Buffer.from(bytes));
	}
	var THROW_IF_EMPTY_BODY = {
		CopyObjectCommand: true,
		UploadPartCopyCommand: true,
		CompleteMultipartUploadCommand: true
	};
	var throw200ExceptionsMiddleware = (config) => (next, context) => async (args) => {
		const result = await next(args);
		const { response } = result;
		if (!HttpResponse.isInstance(response)) return result;
		const { statusCode, body } = response;
		if (statusCode < 200 || statusCode >= 300) return result;
		const bodyBytes = await collectBody(body, config);
		response.body = toStream(bodyBytes);
		if (bodyBytes.length === 0 && THROW_IF_EMPTY_BODY[context.commandName]) {
			const err = /* @__PURE__ */ new Error("S3 aborted request");
			err.$metadata = { httpStatusCode: 503 };
			err.name = "InternalError";
			throw err;
		}
		const bodyStringTail = config.utf8Encoder(bodyBytes.subarray(bodyBytes.length - 16));
		if (bodyStringTail && bodyStringTail.endsWith("</Error>")) response.statusCode = 503;
		return result;
	};
	var collectBody = (streamBody = /* @__PURE__ */ new Uint8Array(), context) => {
		if (streamBody instanceof Uint8Array) return Promise.resolve(streamBody);
		return context.streamCollector(streamBody) || Promise.resolve(/* @__PURE__ */ new Uint8Array());
	};
	var throw200ExceptionsMiddlewareOptions = {
		relation: "after",
		toMiddleware: "deserializerMiddleware",
		tags: ["THROW_200_EXCEPTIONS", "S3"],
		name: "throw200ExceptionsMiddleware",
		override: true
	};
	var getThrow200ExceptionsPlugin = (config) => ({ applyToStack: (clientStack) => {
		clientStack.addRelativeTo(throw200ExceptionsMiddleware(config), throw200ExceptionsMiddlewareOptions);
	} });
	function bucketEndpointMiddleware$1(options) {
		return (next, context) => async (args) => {
			if (options.bucketEndpoint) {
				const endpoint = context.endpointV2;
				if (endpoint) {
					const bucket = args.input.Bucket;
					if (typeof bucket === "string") try {
						const bucketEndpointUrl = new URL(bucket);
						context.endpointV2 = {
							...endpoint,
							url: bucketEndpointUrl
						};
					} catch (e) {
						const warning = `@aws-sdk/middleware-sdk-s3: bucketEndpoint=true was set but Bucket=${bucket} could not be parsed as URL.`;
						if (context.logger?.constructor?.name === "NoOpLogger") console.warn(warning);
						else context.logger?.warn?.(warning);
						throw e;
					}
				}
			}
			return next(args);
		};
	}
	var bucketEndpointMiddlewareOptions$1 = {
		name: "bucketEndpointMiddleware",
		override: true,
		relation: "after",
		toMiddleware: "endpointV2Middleware"
	};
	function validateBucketNameMiddleware({ bucketEndpoint }) {
		return (next) => async (args) => {
			const { input: { Bucket } } = args;
			if (!bucketEndpoint && typeof Bucket === "string" && !validate(Bucket) && Bucket.indexOf("/") >= 0) {
				const err = /* @__PURE__ */ new Error(`Bucket name shouldn't contain '/', received '${Bucket}'`);
				err.name = "InvalidBucketName";
				throw err;
			}
			return next({ ...args });
		};
	}
	var validateBucketNameMiddlewareOptions = {
		step: "initialize",
		tags: ["VALIDATE_BUCKET_NAME"],
		name: "validateBucketNameMiddleware",
		override: true
	};
	var getValidateBucketNamePlugin = (options) => ({ applyToStack: (clientStack) => {
		clientStack.add(validateBucketNameMiddleware(options), validateBucketNameMiddlewareOptions);
		clientStack.addRelativeTo(bucketEndpointMiddleware$1(options), bucketEndpointMiddlewareOptions$1);
	} });
	var S3RestXmlProtocol = class extends AwsRestXmlProtocol {
		async serializeRequest(operationSchema, input, context) {
			const request = await super.serializeRequest(operationSchema, input, context);
			const ns = NormalizedSchema.of(operationSchema.input);
			const staticStructureSchema = ns.getSchema();
			let bucketMemberIndex = 0;
			const requiredMemberCount = staticStructureSchema[6] ?? 0;
			if (input && typeof input === "object") for (const [memberName, memberNs] of ns.structIterator()) {
				if (++bucketMemberIndex > requiredMemberCount) break;
				if (memberName === "Bucket") {
					if (!input.Bucket && memberNs.getMergedTraits().httpLabel) throw new Error(`No value provided for input HTTP label: Bucket.`);
					break;
				}
			}
			return request;
		}
	};
	var NODE_USE_ARN_REGION_ENV_NAME = "AWS_S3_USE_ARN_REGION";
	var NODE_USE_ARN_REGION_INI_NAME = "s3_use_arn_region";
	var NODE_USE_ARN_REGION_CONFIG_OPTIONS = {
		environmentVariableSelector: (env) => booleanSelector(env, NODE_USE_ARN_REGION_ENV_NAME, SelectorType.ENV),
		configFileSelector: (profile) => booleanSelector(profile, NODE_USE_ARN_REGION_INI_NAME, SelectorType.CONFIG),
		default: void 0
	};
	function addExpectContinueMiddleware(options) {
		return (next) => async (args) => {
			const { request } = args;
			if (options.expectContinueHeader !== false && HttpRequest.isInstance(request) && request.body && options.runtime === "node" && options.requestHandler?.constructor?.name !== "FetchHttpHandler") {
				let sendHeader = true;
				if (typeof options.expectContinueHeader === "number") try {
					sendHeader = (Number(request.headers?.["content-length"]) ?? options.bodyLengthChecker?.(request.body) ?? Infinity) >= options.expectContinueHeader;
				} catch (e) {}
				else sendHeader = !!options.expectContinueHeader;
				if (sendHeader) request.headers.Expect = "100-continue";
			}
			return next({
				...args,
				request
			});
		};
	}
	var addExpectContinueMiddlewareOptions = {
		step: "build",
		tags: ["SET_EXPECT_HEADER", "EXPECT_HEADER"],
		name: "addExpectContinueMiddleware",
		override: true
	};
	var getAddExpectContinuePlugin = (options) => ({ applyToStack: (clientStack) => {
		clientStack.add(addExpectContinueMiddleware(options), addExpectContinueMiddlewareOptions);
	} });
	function ssecMiddleware(options) {
		return (next) => async (args) => {
			const input = { ...args.input };
			for (const prop of [{
				target: "SSECustomerKey",
				hash: "SSECustomerKeyMD5"
			}, {
				target: "CopySourceSSECustomerKey",
				hash: "CopySourceSSECustomerKeyMD5"
			}]) {
				const value = input[prop.target];
				if (value) {
					let valueForHash;
					if (typeof value === "string") {
						if (isValidBase64EncodedSSECustomerKey(value, options)) valueForHash = options.base64Decoder(value);
						else {
							valueForHash = options.utf8Decoder(value);
							input[prop.target] = options.base64Encoder(valueForHash);
						}
					} else {
						valueForHash = ArrayBuffer.isView(value) ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength) : new Uint8Array(value);
						input[prop.target] = options.base64Encoder(valueForHash);
					}
					const hash = new options.md5();
					hash.update(valueForHash);
					input[prop.hash] = options.base64Encoder(await hash.digest());
				}
			}
			return next({
				...args,
				input
			});
		};
	}
	var ssecMiddlewareOptions = {
		name: "ssecMiddleware",
		step: "initialize",
		tags: ["SSE"],
		override: true
	};
	var getSsecPlugin = (config) => ({ applyToStack: (clientStack) => {
		clientStack.add(ssecMiddleware(config), ssecMiddlewareOptions);
	} });
	function isValidBase64EncodedSSECustomerKey(str, options) {
		if (!/^(?:[A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(str)) return false;
		try {
			return options.base64Decoder(str).length === 32;
		} catch {
			return false;
		}
	}
	exports.NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_OPTIONS = NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_OPTIONS;
	exports.NODE_USE_ARN_REGION_CONFIG_OPTIONS = NODE_USE_ARN_REGION_CONFIG_OPTIONS;
	exports.S3RestXmlProtocol = S3RestXmlProtocol;
	exports.getAddExpectContinuePlugin = getAddExpectContinuePlugin;
	exports.getCheckContentLengthHeaderPlugin = getCheckContentLengthHeaderPlugin;
	exports.getRegionRedirectMiddlewarePlugin = getRegionRedirectMiddlewarePlugin;
	exports.getS3ExpiresMiddlewarePlugin = getS3ExpiresMiddlewarePlugin;
	exports.getS3ExpressHttpSigningPlugin = getS3ExpressHttpSigningPlugin;
	exports.getS3ExpressPlugin = getS3ExpressPlugin;
	exports.getSsecPlugin = getSsecPlugin;
	exports.getThrow200ExceptionsPlugin = getThrow200ExceptionsPlugin;
	exports.getValidateBucketNamePlugin = getValidateBucketNamePlugin;
	exports.resolveS3Config = resolveS3Config;
}));
//#endregion
//#region node_modules/@aws-sdk/core/dist-cjs/submodules/httpAuthSchemes/index.js
var require_httpAuthSchemes = /* @__PURE__ */ __commonJSMin(((exports) => {
	var { ProviderError, booleanSelector, SelectorType, loadConfig } = require_config();
	var { setCredentialFeature } = require_client$1();
	var { normalizeProvider, memoizeIdentityProvider, isIdentityExpired, doesIdentityRequireRefresh } = require_dist_cjs();
	var { SignatureV4 } = (init_dist_es$3(), __toCommonJS(dist_es_exports$5));
	var { HttpResponse, HttpRequest } = require_protocols$1();
	var getDateHeader = (response) => HttpResponse.isInstance(response) ? response.headers?.date ?? response.headers?.Date : void 0;
	var getAgeHeader = (response) => HttpResponse.isInstance(response) ? response.headers?.age ?? response.headers?.Age : void 0;
	var getSkewCorrectedDate = (systemClockOffset) => new Date(Date.now() + systemClockOffset);
	var getUpdatedSystemClockOffset = (clockTime, currentSystemClockOffset, timeRequestSent, ageHeader) => {
		if (ageHeader !== void 0) return currentSystemClockOffset;
		const serverTime = Date.parse(clockTime);
		const timeResponseReceived = Date.now();
		if (timeRequestSent !== void 0 && timeResponseReceived - timeRequestSent > 9e5) return currentSystemClockOffset;
		return timeRequestSent !== void 0 ? serverTime - (timeRequestSent + timeResponseReceived) / 2 : serverTime - timeResponseReceived;
	};
	var throwSigningPropertyError = (name, property) => {
		if (!property) throw new Error(`Property \`${name}\` is not resolved for AWS SDK SigV4Auth`);
		return property;
	};
	var validateSigningProperties = async (signingProperties) => {
		const context = throwSigningPropertyError("context", signingProperties.context);
		const config = throwSigningPropertyError("config", signingProperties.config);
		const authScheme = context.endpointV2?.properties?.authSchemes?.[0];
		return {
			config,
			signer: await throwSigningPropertyError("signer", config.signer)(authScheme),
			signingRegion: signingProperties?.signingRegion,
			signingRegionSet: signingProperties?.signingRegionSet,
			signingName: signingProperties?.signingName
		};
	};
	var AwsSdkSigV4Signer = class {
		async sign(httpRequest, identity, signingProperties) {
			if (!HttpRequest.isInstance(httpRequest)) throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
			const validatedProps = await validateSigningProperties(signingProperties);
			const { config, signer } = validatedProps;
			let { signingRegion, signingName } = validatedProps;
			const handlerExecutionContext = signingProperties.context;
			if (handlerExecutionContext?.authSchemes?.length ?? false) {
				const [first, second] = handlerExecutionContext.authSchemes;
				if (first?.name === "sigv4a" && second?.name === "sigv4") {
					signingRegion = second?.signingRegion ?? signingRegion;
					signingName = second?.signingName ?? signingName;
				}
			}
			const noSkewCorrection = await config.disableClockSkewCorrection?.() === true;
			signingProperties._disableClockSkewCorrection = noSkewCorrection;
			if (!noSkewCorrection) {
				signingProperties._preRequestSystemClockOffset = config.systemClockOffset;
				signingProperties._requestSentAt = Date.now();
			}
			return await signer.sign(httpRequest, {
				signingDate: noSkewCorrection ? /* @__PURE__ */ new Date() : getSkewCorrectedDate(config.systemClockOffset),
				signingRegion,
				signingService: signingName
			});
		}
		errorHandler(signingProperties) {
			return (error) => {
				const errorException = error;
				if (!signingProperties._disableClockSkewCorrection) {
					const serverTime = errorException.ServerTime ?? getDateHeader(errorException.$response);
					if (serverTime) {
						const config = throwSigningPropertyError("config", signingProperties.config);
						const preRequestOffset = signingProperties._preRequestSystemClockOffset;
						const timeRequestSent = signingProperties._requestSentAt;
						const ageHeader = getAgeHeader(errorException.$response);
						const newOffset = getUpdatedSystemClockOffset(serverTime, config.systemClockOffset, timeRequestSent, ageHeader);
						config.systemClockOffset = newOffset;
						if (Math.abs(newOffset) >= 24e4 && (newOffset !== preRequestOffset || preRequestOffset !== void 0 && preRequestOffset !== newOffset) && errorException.$metadata) errorException.$metadata.clockSkewCorrected = true;
					}
				}
				throw error;
			};
		}
		successHandler(httpResponse, signingProperties) {
			if (signingProperties._disableClockSkewCorrection) return;
			const dateHeader = getDateHeader(httpResponse);
			if (dateHeader) {
				const config = throwSigningPropertyError("config", signingProperties.config);
				const timeRequestSent = signingProperties._requestSentAt;
				const ageHeader = getAgeHeader(httpResponse);
				config.systemClockOffset = getUpdatedSystemClockOffset(dateHeader, config.systemClockOffset, timeRequestSent, ageHeader);
			}
		}
	};
	var AWSSDKSigV4Signer = AwsSdkSigV4Signer;
	var AwsSdkSigV4ASigner = class extends AwsSdkSigV4Signer {
		async sign(httpRequest, identity, signingProperties) {
			if (!HttpRequest.isInstance(httpRequest)) throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
			const { config, signer, signingRegion, signingRegionSet, signingName } = await validateSigningProperties(signingProperties);
			const multiRegionOverride = (await config.sigv4aSigningRegionSet?.() ?? signingRegionSet ?? [signingRegion]).join(",");
			const noSkewCorrection = await config.disableClockSkewCorrection?.() === true;
			signingProperties._disableClockSkewCorrection = noSkewCorrection;
			if (!noSkewCorrection) {
				signingProperties._preRequestSystemClockOffset = config.systemClockOffset;
				signingProperties._requestSentAt = Date.now();
			}
			return await signer.sign(httpRequest, {
				signingDate: noSkewCorrection ? /* @__PURE__ */ new Date() : getSkewCorrectedDate(config.systemClockOffset),
				signingRegion: multiRegionOverride,
				signingService: signingName
			});
		}
	};
	var getArrayForCommaSeparatedString = (str) => typeof str === "string" && str.length > 0 ? str.split(",").map((item) => item.trim()) : [];
	var getBearerTokenEnvKey = (signingName) => `AWS_BEARER_TOKEN_${signingName.replace(/[\s-]/g, "_").toUpperCase()}`;
	var NODE_AUTH_SCHEME_PREFERENCE_ENV_KEY = "AWS_AUTH_SCHEME_PREFERENCE";
	var NODE_AUTH_SCHEME_PREFERENCE_CONFIG_KEY = "auth_scheme_preference";
	var NODE_AUTH_SCHEME_PREFERENCE_OPTIONS = {
		environmentVariableSelector: (env, options) => {
			if (options?.signingName) {
				if (getBearerTokenEnvKey(options.signingName) in env) return ["httpBearerAuth"];
			}
			if (!(NODE_AUTH_SCHEME_PREFERENCE_ENV_KEY in env)) return void 0;
			return getArrayForCommaSeparatedString(env[NODE_AUTH_SCHEME_PREFERENCE_ENV_KEY]);
		},
		configFileSelector: (profile) => {
			if (!(NODE_AUTH_SCHEME_PREFERENCE_CONFIG_KEY in profile)) return void 0;
			return getArrayForCommaSeparatedString(profile[NODE_AUTH_SCHEME_PREFERENCE_CONFIG_KEY]);
		},
		default: []
	};
	var resolveAwsSdkSigV4AConfig = (config) => {
		config.sigv4aSigningRegionSet = normalizeProvider(config.sigv4aSigningRegionSet);
		return config;
	};
	var NODE_SIGV4A_CONFIG_OPTIONS = {
		environmentVariableSelector(env) {
			if (env.AWS_SIGV4A_SIGNING_REGION_SET) return env.AWS_SIGV4A_SIGNING_REGION_SET.split(",").map((_) => _.trim());
			throw new ProviderError("AWS_SIGV4A_SIGNING_REGION_SET not set in env.", { tryNextLink: true });
		},
		configFileSelector(profile) {
			if (profile.sigv4a_signing_region_set) return (profile.sigv4a_signing_region_set ?? "").split(",").map((_) => _.trim());
			throw new ProviderError("sigv4a_signing_region_set not set in profile.", { tryNextLink: true });
		},
		default: void 0
	};
	var bindResolveAwsSdkSigV4Config = (defaultDisableClockSkewCorrection) => (config) => {
		let inputCredentials = config.credentials;
		let isUserSupplied = !!config.credentials;
		let resolvedCredentials = void 0;
		Object.defineProperty(config, "credentials", {
			set(credentials) {
				if (credentials && credentials !== inputCredentials && credentials !== resolvedCredentials) isUserSupplied = true;
				inputCredentials = credentials;
				const boundProvider = bindCallerConfig(config, normalizeCredentialProvider(config, {
					credentials: inputCredentials,
					credentialDefaultProvider: config.credentialDefaultProvider
				}));
				if (isUserSupplied && !boundProvider.attributed) {
					const isCredentialObject = typeof inputCredentials === "object" && inputCredentials !== null;
					resolvedCredentials = async (options) => {
						const attributedCreds = await boundProvider(options);
						if (isCredentialObject && (!attributedCreds.$source || Object.keys(attributedCreds.$source).length === 0)) return setCredentialFeature(attributedCreds, "CREDENTIALS_CODE", "e");
						return attributedCreds;
					};
					resolvedCredentials.memoized = boundProvider.memoized;
					resolvedCredentials.configBound = boundProvider.configBound;
					resolvedCredentials.attributed = true;
				} else resolvedCredentials = boundProvider;
			},
			get() {
				return resolvedCredentials;
			},
			enumerable: true,
			configurable: true
		});
		config.credentials = inputCredentials;
		const { signingEscapePath = true, systemClockOffset = config.systemClockOffset || 0, sha256 } = config;
		let signer;
		if (config.signer) signer = normalizeProvider(config.signer);
		else if (config.regionInfoProvider) signer = () => normalizeProvider(config.region)().then(async (region) => [await config.regionInfoProvider(region, {
			useFipsEndpoint: await config.useFipsEndpoint(),
			useDualstackEndpoint: await config.useDualstackEndpoint()
		}) || {}, region]).then(([regionInfo, region]) => {
			const { signingRegion, signingService } = regionInfo;
			config.signingRegion = config.signingRegion || signingRegion || region;
			config.signingName = config.signingName || signingService || config.serviceId;
			const params = {
				...config,
				credentials: config.credentials,
				region: config.signingRegion,
				service: config.signingName,
				sha256,
				uriEscapePath: signingEscapePath
			};
			return new (config.signerConstructor || SignatureV4)(params);
		});
		else signer = async (authScheme) => {
			authScheme = Object.assign({}, {
				name: "sigv4",
				signingName: config.signingName || config.defaultSigningName,
				signingRegion: await normalizeProvider(config.region)(),
				properties: {}
			}, authScheme);
			const signingRegion = authScheme.signingRegion;
			const signingService = authScheme.signingName;
			config.signingRegion = config.signingRegion || signingRegion;
			config.signingName = config.signingName || signingService || config.serviceId;
			const params = {
				...config,
				credentials: config.credentials,
				region: config.signingRegion,
				service: config.signingName,
				sha256,
				uriEscapePath: signingEscapePath
			};
			return new (config.signerConstructor || SignatureV4)(params);
		};
		return Object.assign(config, {
			systemClockOffset,
			signingEscapePath,
			signer,
			disableClockSkewCorrection: normalizeProvider(config.disableClockSkewCorrection ?? defaultDisableClockSkewCorrection)
		});
	};
	function normalizeCredentialProvider(config, { credentials, credentialDefaultProvider }) {
		let credentialsProvider;
		if (credentials) {
			if (!credentials?.memoized) credentialsProvider = memoizeIdentityProvider(credentials, isIdentityExpired, doesIdentityRequireRefresh);
			else credentialsProvider = credentials;
		} else if (credentialDefaultProvider) credentialsProvider = normalizeProvider(credentialDefaultProvider(Object.assign({}, config, { parentClientConfig: config })));
		else credentialsProvider = async () => {
			throw new Error("@aws-sdk/core::resolveAwsSdkSigV4Config - `credentials` not provided and no credentialDefaultProvider was configured.");
		};
		credentialsProvider.memoized = true;
		return credentialsProvider;
	}
	function bindCallerConfig(config, credentialsProvider) {
		if (credentialsProvider.configBound) return credentialsProvider;
		const fn = async (options) => credentialsProvider({
			...options,
			callerClientConfig: config
		});
		fn.memoized = credentialsProvider.memoized;
		fn.configBound = true;
		return fn;
	}
	var ENV_DISABLE_CLOCK_SKEW_CORRECTION = "AWS_DISABLE_CLOCK_SKEW_CORRECTION";
	var CONFIG_DISABLE_CLOCK_SKEW_CORRECTION = "disable_clock_skew_correction";
	var resolveAwsSdkSigV4Config = bindResolveAwsSdkSigV4Config(loadConfig({
		environmentVariableSelector: (env) => booleanSelector(env, ENV_DISABLE_CLOCK_SKEW_CORRECTION, SelectorType.ENV),
		configFileSelector: (profile) => booleanSelector(profile, CONFIG_DISABLE_CLOCK_SKEW_CORRECTION, SelectorType.CONFIG),
		default: false
	}));
	var resolveAWSSDKSigV4Config = resolveAwsSdkSigV4Config;
	exports.AWSSDKSigV4Signer = AWSSDKSigV4Signer;
	exports.AwsSdkSigV4ASigner = AwsSdkSigV4ASigner;
	exports.AwsSdkSigV4Signer = AwsSdkSigV4Signer;
	exports.NODE_AUTH_SCHEME_PREFERENCE_OPTIONS = NODE_AUTH_SCHEME_PREFERENCE_OPTIONS;
	exports.NODE_SIGV4A_CONFIG_OPTIONS = NODE_SIGV4A_CONFIG_OPTIONS;
	exports.getBearerTokenEnvKey = getBearerTokenEnvKey;
	exports.resolveAWSSDKSigV4Config = resolveAWSSDKSigV4Config;
	exports.resolveAwsSdkSigV4AConfig = resolveAwsSdkSigV4AConfig;
	exports.resolveAwsSdkSigV4Config = resolveAwsSdkSigV4Config;
	exports.validateSigningProperties = validateSigningProperties;
}));
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/endpoint/bdd.js
var import_schema = require_schema();
var import_config = require_config();
var import_event_streams = require_event_streams();
var import_retry = require_retry();
var import_dist_cjs = require_dist_cjs();
var import_client$1 = require_client$1();
var import_flexible_checksums = require_flexible_checksums();
init_dist_es$2();
var import_s3 = require_s3();
var import_httpAuthSchemes = require_httpAuthSchemes();
var import_endpoints = require_endpoints();
var aw = "ref";
var ax = "argv";
var ay = "backend";
var az = "authSchemes";
var aA = "disableDoubleEncoding";
var aB = "signingName";
var aC = "signingRegion";
var aD = "signingRegionSet";
var a = -1;
var b = true;
var c = false;
var d = "isSet";
var e = "booleanEquals";
var f = "stringEquals";
var g = "coalesce";
var h = "substring";
var i = "";
var j = "aws.partition";
var k = "partitionResult";
var l = "accessPointSuffix";
var m = "regionPrefix";
var n = (n) => "outpostId_ssa_" + n + i;
var o = "hardwareType";
var p = "ite";
var q = "isValidHostLabel";
var s = "sigv4";
var t = "aws.isVirtualHostableS3Bucket";
var u = "url";
var v = "getAttr";
var w = "bucketArn";
var x = "--";
var y = "arnType";
var z = "accesspoint";
var A = (n) => "accessPointName_ssa_" + n + i;
var B = "s3-object-lambda";
var C = "s3-outposts";
var D = "bucketPartition";
var E = "us-east-1";
var F = "outpostType";
var G = "name";
var H = "s3";
var I = "{url#scheme}://{Bucket}.{url#authority}{url#path}";
var J = "{url#scheme}://{url#authority}{url#path}";
var K = "{url#scheme}://{url#authority}{url#normalizedPath}{Bucket}";
var L = "https://{Bucket}.s3-accelerate.{partitionResult#dnsSuffix}";
var M = "https://{Bucket}.s3.{partitionResult#dnsSuffix}";
var N = (n) => "{url#scheme}://{accessPointName_ssa_" + n + "}-{bucketArn#accountId}.{url#authority}{url#path}";
var O = (n) => "Invalid ARN: The access point name may only contain a-z, A-Z, 0-9 and `-`. Found: `{accessPointName_ssa_" + n + "}`";
var P = "sigv4a";
var Q = "{url#scheme}://{url#authority}{url#normalizedPath}{uri_encoded_bucket}";
var R = "https://s3.{partitionResult#dnsSuffix}/{uri_encoded_bucket}";
var S = "https://s3.{partitionResult#dnsSuffix}";
var T = { [aw]: "UseFIPS" };
var U = { [aw]: "UseDualStack" };
var V = { [aw]: "Bucket" };
var W = {
	"fn": v,
	[ax]: [{ [aw]: k }, G]
};
var X = { [aw]: u };
var Y = { [aw]: "Region" };
var Z = { [aw]: w };
var aa = { [aw]: y };
var ab = { [aw]: "accessPointName_ssa_1" };
var ac = {
	"fn": v,
	[ax]: [Z, "region"]
};
var ad = { [aw]: o };
var ae = {
	"fn": v,
	[ax]: [Z, "service"]
};
var af = {
	"fn": v,
	[ax]: [Z, "accountId"]
};
var ag = {
	[ay]: "S3Express",
	[az]: [{
		[aA]: true,
		[G]: "{_s3e_auth}",
		[aB]: "s3express",
		[aC]: "{Region}"
	}]
};
var ah = {
	[ay]: "S3Express",
	[az]: [{
		[aA]: true,
		[G]: s,
		[aB]: "s3express",
		[aC]: "{Region}"
	}]
};
var ai = { [az]: [{
	[aA]: true,
	[G]: P,
	[aB]: C,
	[aD]: ["*"]
}, {
	[aA]: true,
	[G]: s,
	[aB]: C,
	[aC]: "{Region}"
}] };
var aj = { [az]: [{
	[aA]: true,
	[G]: s,
	[aB]: H,
	[aC]: E
}] };
var ak = { [az]: [{
	[aA]: true,
	[G]: s,
	[aB]: H,
	[aC]: "{Region}"
}] };
var al = { [az]: [{
	[aA]: true,
	[G]: s,
	[aB]: B,
	[aC]: "{bucketArn#region}"
}] };
var am = { [az]: [{
	[aA]: true,
	[G]: s,
	[aB]: H,
	[aC]: "{bucketArn#region}"
}] };
var an = { [az]: [{
	[aA]: true,
	[G]: P,
	[aB]: C,
	[aD]: ["*"]
}, {
	[aA]: true,
	[G]: s,
	[aB]: C,
	[aC]: "{bucketArn#region}"
}] };
var ao = { [az]: [{
	[aA]: true,
	[G]: s,
	[aB]: B,
	[aC]: "{Region}"
}] };
var ap = [Y];
var aq = [{ [aw]: "Endpoint" }];
var as = [V];
var at = [
	V,
	0,
	7,
	true
];
var au = [Z, "resourceId[1]"];
var av = ["*"];
var _data = {
	conditions: [
		[d, ap],
		[e, [{ [aw]: "Accelerate" }, b]],
		[e, [T, b]],
		[e, [U, b]],
		[d, aq],
		[d, as],
		[f, [{
			fn: g,
			[ax]: [{
				fn: h,
				[ax]: [
					V,
					0,
					6,
					b
				]
			}, i]
		}, "--x-s3"]],
		[f, [{
			fn: g,
			[ax]: [{
				fn: h,
				[ax]: at
			}, i]
		}, "--xa-s3"]],
		[
			j,
			ap,
			k
		],
		[
			h,
			at,
			l
		],
		[f, [{ [aw]: l }, "--op-s3"]],
		[
			h,
			[
				V,
				8,
				12,
				b
			],
			m
		],
		[
			h,
			[
				V,
				32,
				49,
				b
			],
			n(2)
		],
		[
			h,
			[
				V,
				49,
				50,
				b
			],
			o
		],
		[e, [{ [aw]: "ForcePathStyle" }, b]],
		[f, [W, "aws-cn"]],
		[
			p,
			[
				U,
				".dualstack",
				i
			],
			"_s3e_ds"
		],
		[q, [{ [aw]: n(2) }, c]],
		[
			p,
			[
				T,
				"-fips",
				i
			],
			"_s3e_fips"
		],
		[
			p,
			[
				{
					fn: g,
					[ax]: [{ [aw]: "DisableS3ExpressSessionAuth" }, c]
				},
				s,
				"sigv4-s3express"
			],
			"_s3e_auth"
		],
		[t, [V, c]],
		[
			"parseURL",
			aq,
			u
		],
		[e, [{
			fn: g,
			[ax]: [{ [aw]: "UseS3ExpressControlEndpoint" }, c]
		}, b]],
		[t, [V, b]],
		[f, [{
			fn: v,
			[ax]: [X, "scheme"]
		}, "http"]],
		[q, [Y, c]],
		[
			"aws.parseArn",
			as,
			w
		],
		[
			v,
			[{
				fn: "split",
				[ax]: [
					V,
					x,
					0
				]
			}, "[-2]"],
			"s3expressAvailabilityZoneId"
		],
		[f, [{
			fn: g,
			[ax]: [{
				fn: h,
				[ax]: [
					V,
					0,
					4,
					c
				]
			}, i]
		}, "arn:"]],
		[f, [{
			fn: g,
			[ax]: [{
				fn: h,
				[ax]: [
					V,
					16,
					18,
					b
				]
			}, i]
		}, x]],
		[e, [{
			fn: v,
			[ax]: [X, "isIp"]
		}, b]],
		[f, [{
			fn: g,
			[ax]: [{
				fn: h,
				[ax]: [
					V,
					21,
					23,
					b
				]
			}, i]
		}, x]],
		[f, [{
			fn: g,
			[ax]: [{
				fn: h,
				[ax]: [
					V,
					27,
					29,
					b
				]
			}, i]
		}, x]],
		[f, [{ [aw]: m }, "beta"]],
		[
			"uriEncode",
			as,
			"uri_encoded_bucket"
		],
		[q, [Y, b]],
		[e, [{
			fn: g,
			[ax]: [{ [aw]: "UseObjectLambdaEndpoint" }, c]
		}, b]],
		[
			v,
			[Z, "resourceId[0]"],
			y
		],
		[f, [aa, i]],
		[f, [aa, z]],
		[
			v,
			au,
			A(1)
		],
		[f, [ab, i]],
		[f, [ac, i]],
		[f, [{
			fn: g,
			[ax]: [{
				fn: h,
				[ax]: [
					V,
					14,
					16,
					b
				]
			}, i]
		}, x]],
		[f, [ad, "e"]],
		[f, [ad, "o"]],
		[f, [Y, "aws-global"]],
		[f, [{
			fn: g,
			[ax]: [{
				fn: h,
				[ax]: [
					V,
					19,
					21,
					b
				]
			}, i]
		}, x]],
		[f, [ae, B]],
		[e, [{
			fn: g,
			[ax]: [{ [aw]: "DisableAccessPoints" }, c]
		}, b]],
		[f, [ae, C]],
		[
			j,
			[ac],
			D
		],
		[q, [ab, b]],
		[f, [{
			fn: g,
			[ax]: [{
				fn: h,
				[ax]: [
					V,
					26,
					28,
					b
				]
			}, i]
		}, x]],
		[f, [{
			fn: g,
			[ax]: [{
				fn: h,
				[ax]: [
					V,
					15,
					17,
					b
				]
			}, i]
		}, x]],
		[v, [Z, "resourceId[4]"]],
		[f, [{
			fn: g,
			[ax]: [{
				fn: h,
				[ax]: [
					V,
					20,
					22,
					b
				]
			}, i]
		}, x]],
		[e, [{ [aw]: "UseGlobalEndpoint" }, b]],
		[f, [Y, E]],
		[
			v,
			au,
			n(1)
		],
		[e, [{
			fn: g,
			[ax]: [{ [aw]: "UseArnRegion" }, b]
		}, b]],
		[q, [{ [aw]: n(1) }, c]],
		[
			v,
			[Z, "resourceId[2]"],
			F
		],
		[f, [Y, ac]],
		[f, [{
			fn: v,
			[ax]: [{ [aw]: D }, G]
		}, W]],
		[e, [{ [aw]: "DisableMultiRegionAccessPoints" }, b]],
		[q, [ac, b]],
		[f, [{
			fn: v,
			[ax]: [Z, "partition"]
		}, W]],
		[f, [af, i]],
		[f, [ae, H]],
		[q, [af, c]],
		[
			v,
			[Z, "resourceId[3]"],
			A(2)
		],
		[q, [ab, c]],
		[f, [{ [aw]: F }, z]],
		[q, [{ [aw]: A(2) }, c]]
	],
	results: [
		[a],
		[a, "Accelerate cannot be used with FIPS"],
		[a, "Cannot set dual-stack in combination with a custom endpoint."],
		[a, "A custom endpoint cannot be combined with FIPS"],
		[a, "A custom endpoint cannot be combined with S3 Accelerate"],
		[a, "Partition does not support FIPS"],
		[a, "S3Express does not support S3 Accelerate."],
		["{url#scheme}://{url#authority}/{uri_encoded_bucket}{url#path}", ag],
		[I, ag],
		[a, "S3Express bucket name is not a valid virtual hostable name."],
		["https://s3express-control{_s3e_fips}{_s3e_ds}.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", ah],
		["https://{Bucket}.s3express{_s3e_fips}-{s3expressAvailabilityZoneId}{_s3e_ds}.{Region}.{partitionResult#dnsSuffix}", ag],
		[a, "Unrecognized S3Express bucket name format."],
		[J, ag],
		["https://s3express-control{_s3e_fips}{_s3e_ds}.{Region}.{partitionResult#dnsSuffix}", ah],
		[a, "Expected a endpoint to be specified but no endpoint was found"],
		["https://{Bucket}.ec2.{url#authority}", ai],
		["https://{Bucket}.ec2.s3-outposts.{Region}.{partitionResult#dnsSuffix}", ai],
		["https://{Bucket}.op-{outpostId_ssa_2}.{url#authority}", ai],
		["https://{Bucket}.op-{outpostId_ssa_2}.s3-outposts.{Region}.{partitionResult#dnsSuffix}", ai],
		[a, "Unrecognized hardware type: \"Expected hardware type o or e but got {hardwareType}\""],
		[a, "Invalid Outposts Bucket alias - it must be a valid bucket name."],
		[a, "Invalid ARN: The outpost Id must only contain a-z, A-Z, 0-9 and `-`."],
		[a, "Custom endpoint `{Endpoint}` was not a valid URI"],
		[a, "S3 Accelerate cannot be used in this region"],
		["https://{Bucket}.s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://{Bucket}.s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}", ak],
		["https://{Bucket}.s3-fips.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://{Bucket}.s3-fips.{Region}.{partitionResult#dnsSuffix}", ak],
		["https://{Bucket}.s3-accelerate.dualstack.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://{Bucket}.s3-accelerate.dualstack.{partitionResult#dnsSuffix}", ak],
		["https://{Bucket}.s3.dualstack.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://{Bucket}.s3.dualstack.{Region}.{partitionResult#dnsSuffix}", ak],
		[K, aj],
		[I, aj],
		[K, ak],
		[I, ak],
		[L, aj],
		[L, ak],
		[M, aj],
		[M, ak],
		["https://{Bucket}.s3.{Region}.{partitionResult#dnsSuffix}", ak],
		[a, "Invalid region: region was not a valid DNS name."],
		[a, "S3 Object Lambda does not support Dual-stack"],
		[a, "S3 Object Lambda does not support S3 Accelerate"],
		[a, "Access points are not supported for this operation"],
		[a, "Invalid configuration: region from ARN `{bucketArn#region}` does not match client region `{Region}` and UseArnRegion is `false`"],
		[a, "Invalid ARN: Missing account id"],
		[N(1), al],
		["https://{accessPointName_ssa_1}-{bucketArn#accountId}.s3-object-lambda-fips.{bucketArn#region}.{bucketPartition#dnsSuffix}", al],
		["https://{accessPointName_ssa_1}-{bucketArn#accountId}.s3-object-lambda.{bucketArn#region}.{bucketPartition#dnsSuffix}", al],
		[a, O(1)],
		[a, "Invalid ARN: The account id may only contain a-z, A-Z, 0-9 and `-`. Found: `{bucketArn#accountId}`"],
		[a, "Invalid region in ARN: `{bucketArn#region}` (invalid DNS name)"],
		[a, "Client was configured for partition `{partitionResult#name}` but ARN (`{Bucket}`) has `{bucketPartition#name}`"],
		[a, "Invalid ARN: The ARN may only contain a single resource component after `accesspoint`."],
		[a, "Invalid ARN: bucket ARN is missing a region"],
		[a, "Invalid ARN: Expected a resource of the format `accesspoint:<accesspoint name>` but no name was provided"],
		[a, "Invalid ARN: Object Lambda ARNs only support `accesspoint` arn types, but found: `{arnType}`"],
		[a, "Access Points do not support S3 Accelerate"],
		["https://{accessPointName_ssa_1}-{bucketArn#accountId}.s3-accesspoint-fips.dualstack.{bucketArn#region}.{bucketPartition#dnsSuffix}", am],
		["https://{accessPointName_ssa_1}-{bucketArn#accountId}.s3-accesspoint-fips.{bucketArn#region}.{bucketPartition#dnsSuffix}", am],
		["https://{accessPointName_ssa_1}-{bucketArn#accountId}.s3-accesspoint.dualstack.{bucketArn#region}.{bucketPartition#dnsSuffix}", am],
		[N(1), am],
		["https://{accessPointName_ssa_1}-{bucketArn#accountId}.s3-accesspoint.{bucketArn#region}.{bucketPartition#dnsSuffix}", am],
		[a, "Invalid ARN: The ARN was not for the S3 service, found: {bucketArn#service}"],
		[a, "S3 MRAP does not support dual-stack"],
		[a, "S3 MRAP does not support FIPS"],
		[a, "S3 MRAP does not support S3 Accelerate"],
		[a, "Invalid configuration: Multi-Region Access Point ARNs are disabled."],
		["https://{accessPointName_ssa_1}.accesspoint.s3-global.{partitionResult#dnsSuffix}", { [az]: [{
			[aA]: b,
			name: P,
			[aB]: H,
			[aD]: av
		}] }],
		[a, "Client was configured for partition `{partitionResult#name}` but bucket referred to partition `{bucketArn#partition}`"],
		[a, "Invalid Access Point Name"],
		[a, "S3 Outposts does not support Dual-stack"],
		[a, "S3 Outposts does not support FIPS"],
		[a, "S3 Outposts does not support S3 Accelerate"],
		[a, "Invalid Arn: Outpost Access Point ARN contains sub resources"],
		["https://{accessPointName_ssa_2}-{bucketArn#accountId}.{outpostId_ssa_1}.{url#authority}", an],
		["https://{accessPointName_ssa_2}-{bucketArn#accountId}.{outpostId_ssa_1}.s3-outposts.{bucketArn#region}.{bucketPartition#dnsSuffix}", an],
		[a, O(2)],
		[a, "Expected an outpost type `accesspoint`, found {outpostType}"],
		[a, "Invalid ARN: expected an access point name"],
		[a, "Invalid ARN: Expected a 4-component resource"],
		[a, "Invalid ARN: The outpost Id may only contain a-z, A-Z, 0-9 and `-`. Found: `{outpostId_ssa_1}`"],
		[a, "Invalid ARN: The Outpost Id was not set"],
		[a, "Invalid ARN: Unrecognized format: {Bucket} (type: {arnType})"],
		[a, "Invalid ARN: No ARN type specified"],
		[a, "Invalid ARN: `{Bucket}` was not a valid ARN"],
		[a, "Path-style addressing cannot be used with ARN buckets"],
		["https://s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", aj],
		["https://s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", ak],
		["https://s3-fips.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", aj],
		["https://s3-fips.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", ak],
		["https://s3.dualstack.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", aj],
		["https://s3.dualstack.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", ak],
		[Q, aj],
		[Q, ak],
		[R, aj],
		[R, ak],
		["https://s3.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", ak],
		[a, "Path-style addressing cannot be used with S3 Accelerate"],
		[J, ao],
		["https://s3-object-lambda-fips.{Region}.{partitionResult#dnsSuffix}", ao],
		["https://s3-object-lambda.{Region}.{partitionResult#dnsSuffix}", ao],
		["https://s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}", ak],
		["https://s3-fips.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://s3-fips.{Region}.{partitionResult#dnsSuffix}", ak],
		["https://s3.dualstack.us-east-1.{partitionResult#dnsSuffix}", aj],
		["https://s3.dualstack.{Region}.{partitionResult#dnsSuffix}", ak],
		[J, aj],
		[J, ak],
		[S, aj],
		[S, ak],
		["https://s3.{Region}.{partitionResult#dnsSuffix}", ak],
		[a, "A region must be set when sending requests to S3."]
	]
};
var root = 2;
var nodes = new Int32Array([
	-1,
	1,
	-1,
	0,
	3,
	100000115,
	1,
	424,
	4,
	2,
	272,
	5,
	3,
	233,
	6,
	4,
	85,
	7,
	5,
	15,
	8,
	8,
	9,
	100000115,
	16,
	10,
	13,
	18,
	11,
	13,
	19,
	12,
	13,
	22,
	100000014,
	13,
	35,
	14,
	100000042,
	36,
	100000103,
	435,
	6,
	271,
	16,
	7,
	270,
	17,
	8,
	19,
	18,
	14,
	501,
	106,
	9,
	20,
	24,
	10,
	21,
	24,
	11,
	22,
	24,
	12,
	23,
	24,
	13,
	547,
	24,
	14,
	77,
	25,
	20,
	73,
	26,
	26,
	27,
	78,
	37,
	28,
	100000086,
	38,
	100000086,
	29,
	39,
	47,
	30,
	48,
	100000058,
	31,
	50,
	32,
	100000085,
	51,
	33,
	136,
	55,
	100000076,
	34,
	59,
	35,
	100000084,
	60,
	39,
	36,
	61,
	37,
	100000083,
	62,
	38,
	146,
	63,
	41,
	100000046,
	61,
	40,
	100000083,
	62,
	41,
	150,
	64,
	42,
	100000054,
	66,
	43,
	100000053,
	70,
	44,
	100000052,
	71,
	45,
	100000081,
	73,
	46,
	100000080,
	74,
	100000078,
	100000079,
	40,
	48,
	100000057,
	41,
	100000057,
	49,
	42,
	185,
	50,
	48,
	62,
	51,
	49,
	100000045,
	52,
	51,
	53,
	526,
	60,
	56,
	54,
	62,
	100000055,
	55,
	63,
	57,
	100000046,
	62,
	100000055,
	57,
	64,
	58,
	100000054,
	66,
	59,
	100000053,
	69,
	60,
	100000065,
	70,
	61,
	100000052,
	72,
	100000064,
	100000051,
	49,
	100000045,
	63,
	51,
	64,
	526,
	60,
	67,
	65,
	62,
	100000055,
	66,
	63,
	68,
	100000046,
	62,
	100000055,
	68,
	64,
	69,
	100000054,
	66,
	70,
	100000053,
	68,
	100000047,
	71,
	70,
	72,
	100000052,
	72,
	100000050,
	100000051,
	25,
	74,
	100000042,
	46,
	100000039,
	75,
	57,
	76,
	100000041,
	58,
	100000040,
	100000041,
	26,
	100000088,
	78,
	28,
	100000087,
	79,
	34,
	82,
	80,
	35,
	81,
	545,
	36,
	100000103,
	100000115,
	46,
	100000097,
	83,
	57,
	84,
	100000099,
	58,
	100000098,
	100000099,
	5,
	101,
	86,
	8,
	87,
	100000115,
	16,
	88,
	89,
	18,
	91,
	89,
	19,
	90,
	92,
	21,
	97,
	95,
	19,
	93,
	92,
	21,
	98,
	95,
	21,
	97,
	94,
	22,
	100000014,
	95,
	35,
	96,
	100000042,
	36,
	100000103,
	100000042,
	22,
	100000013,
	98,
	35,
	99,
	100000042,
	36,
	100000101,
	100,
	46,
	100000110,
	100000111,
	6,
	214,
	102,
	7,
	208,
	103,
	8,
	119,
	104,
	14,
	118,
	105,
	21,
	106,
	100000023,
	26,
	107,
	502,
	37,
	108,
	100000086,
	38,
	100000086,
	109,
	39,
	112,
	110,
	48,
	100000058,
	111,
	50,
	136,
	100000085,
	40,
	113,
	100000057,
	41,
	100000057,
	114,
	42,
	115,
	500,
	48,
	100000056,
	116,
	52,
	117,
	100000072,
	65,
	100000069,
	100000072,
	21,
	501,
	100000023,
	9,
	120,
	124,
	10,
	121,
	124,
	11,
	122,
	124,
	12,
	123,
	124,
	13,
	202,
	124,
	14,
	195,
	125,
	20,
	190,
	126,
	21,
	127,
	100000023,
	23,
	128,
	129,
	24,
	189,
	129,
	26,
	130,
	197,
	37,
	131,
	100000086,
	38,
	100000086,
	132,
	39,
	159,
	133,
	48,
	100000058,
	134,
	50,
	135,
	100000085,
	51,
	141,
	136,
	55,
	100000076,
	137,
	59,
	138,
	100000084,
	60,
	100000083,
	139,
	61,
	140,
	100000083,
	63,
	100000083,
	100000046,
	55,
	100000076,
	142,
	59,
	143,
	100000084,
	60,
	148,
	144,
	61,
	145,
	100000083,
	62,
	147,
	146,
	63,
	150,
	100000046,
	63,
	153,
	100000046,
	61,
	149,
	100000083,
	62,
	153,
	150,
	64,
	151,
	100000054,
	66,
	152,
	100000053,
	70,
	100000082,
	100000052,
	64,
	154,
	100000054,
	66,
	155,
	100000053,
	70,
	156,
	100000052,
	71,
	157,
	100000081,
	73,
	158,
	100000080,
	74,
	100000077,
	100000079,
	40,
	160,
	100000057,
	41,
	100000057,
	161,
	42,
	185,
	162,
	48,
	174,
	163,
	49,
	100000045,
	164,
	51,
	165,
	526,
	60,
	168,
	166,
	62,
	100000055,
	167,
	63,
	169,
	100000046,
	62,
	100000055,
	169,
	64,
	170,
	100000054,
	66,
	171,
	100000053,
	69,
	172,
	100000065,
	70,
	173,
	100000052,
	72,
	100000063,
	100000051,
	49,
	100000045,
	175,
	51,
	176,
	526,
	60,
	179,
	177,
	62,
	100000055,
	178,
	63,
	180,
	100000046,
	62,
	100000055,
	180,
	64,
	181,
	100000054,
	66,
	182,
	100000053,
	68,
	100000047,
	183,
	70,
	184,
	100000052,
	72,
	100000048,
	100000051,
	48,
	100000056,
	186,
	52,
	187,
	100000072,
	65,
	100000069,
	188,
	67,
	100000070,
	100000071,
	25,
	100000036,
	100000042,
	21,
	191,
	100000023,
	25,
	192,
	100000042,
	30,
	194,
	193,
	46,
	100000034,
	100000036,
	46,
	100000033,
	100000035,
	21,
	196,
	100000023,
	26,
	100000088,
	197,
	28,
	100000087,
	198,
	34,
	201,
	199,
	35,
	200,
	545,
	36,
	100000101,
	100000115,
	46,
	100000095,
	100000096,
	17,
	203,
	100000022,
	20,
	204,
	100000021,
	21,
	205,
	550,
	33,
	206,
	550,
	44,
	100000016,
	207,
	45,
	100000018,
	100000020,
	8,
	209,
	215,
	16,
	210,
	220,
	18,
	211,
	220,
	19,
	212,
	224,
	20,
	213,
	227,
	21,
	231,
	401,
	8,
	218,
	215,
	19,
	216,
	100000009,
	20,
	217,
	227,
	21,
	231,
	100000009,
	16,
	219,
	220,
	18,
	223,
	220,
	19,
	221,
	224,
	20,
	222,
	227,
	21,
	231,
	100000012,
	19,
	226,
	224,
	20,
	225,
	100000009,
	21,
	100000009,
	100000012,
	20,
	230,
	227,
	21,
	228,
	100000009,
	30,
	229,
	100000009,
	34,
	100000007,
	100000009,
	21,
	231,
	415,
	30,
	232,
	100000008,
	34,
	100000007,
	100000008,
	4,
	100000002,
	234,
	5,
	235,
	480,
	6,
	271,
	236,
	7,
	270,
	237,
	8,
	238,
	491,
	9,
	239,
	243,
	10,
	240,
	243,
	11,
	241,
	243,
	12,
	242,
	243,
	13,
	547,
	243,
	14,
	266,
	244,
	20,
	264,
	245,
	26,
	246,
	267,
	37,
	247,
	100000086,
	38,
	100000086,
	248,
	39,
	249,
	518,
	40,
	250,
	100000057,
	41,
	100000057,
	251,
	42,
	538,
	252,
	48,
	100000043,
	253,
	49,
	100000045,
	254,
	51,
	255,
	526,
	60,
	258,
	256,
	62,
	100000055,
	257,
	63,
	259,
	100000046,
	62,
	100000055,
	259,
	64,
	260,
	100000054,
	66,
	261,
	100000053,
	69,
	262,
	100000065,
	70,
	263,
	100000052,
	72,
	100000062,
	100000051,
	25,
	265,
	100000042,
	46,
	100000031,
	100000032,
	26,
	100000088,
	267,
	28,
	100000087,
	268,
	34,
	269,
	544,
	46,
	100000093,
	100000094,
	8,
	397,
	100000009,
	8,
	407,
	100000009,
	3,
	346,
	273,
	4,
	100000003,
	274,
	5,
	284,
	275,
	8,
	276,
	100000115,
	15,
	100000005,
	277,
	16,
	278,
	281,
	18,
	279,
	281,
	19,
	280,
	281,
	22,
	100000014,
	281,
	35,
	282,
	100000042,
	36,
	100000102,
	283,
	46,
	100000106,
	100000107,
	6,
	405,
	285,
	7,
	395,
	286,
	8,
	295,
	287,
	14,
	501,
	288,
	26,
	289,
	502,
	37,
	290,
	100000086,
	38,
	100000086,
	291,
	39,
	292,
	307,
	40,
	293,
	100000057,
	41,
	100000057,
	294,
	42,
	335,
	500,
	9,
	296,
	300,
	10,
	297,
	300,
	11,
	298,
	300,
	12,
	299,
	300,
	13,
	394,
	300,
	14,
	339,
	301,
	15,
	100000005,
	302,
	20,
	337,
	303,
	26,
	304,
	341,
	37,
	305,
	100000086,
	38,
	100000086,
	306,
	39,
	309,
	307,
	48,
	100000058,
	308,
	50,
	100000074,
	100000085,
	40,
	310,
	100000057,
	41,
	100000057,
	311,
	42,
	335,
	312,
	48,
	324,
	313,
	49,
	100000045,
	314,
	51,
	315,
	526,
	60,
	318,
	316,
	62,
	100000055,
	317,
	63,
	319,
	100000046,
	62,
	100000055,
	319,
	64,
	320,
	100000054,
	66,
	321,
	100000053,
	69,
	322,
	100000065,
	70,
	323,
	100000052,
	72,
	100000061,
	100000051,
	49,
	100000045,
	325,
	51,
	326,
	526,
	60,
	329,
	327,
	62,
	100000055,
	328,
	63,
	330,
	100000046,
	62,
	100000055,
	330,
	64,
	331,
	100000054,
	66,
	332,
	100000053,
	68,
	100000047,
	333,
	70,
	334,
	100000052,
	72,
	100000049,
	100000051,
	48,
	100000056,
	336,
	52,
	100000067,
	100000072,
	25,
	338,
	100000042,
	46,
	100000027,
	100000028,
	15,
	100000005,
	340,
	26,
	100000088,
	341,
	28,
	100000087,
	342,
	34,
	345,
	343,
	35,
	344,
	545,
	36,
	100000102,
	100000115,
	46,
	100000091,
	100000092,
	4,
	100000002,
	347,
	5,
	357,
	348,
	8,
	349,
	100000115,
	15,
	100000005,
	350,
	16,
	351,
	354,
	18,
	352,
	354,
	19,
	353,
	354,
	22,
	100000014,
	354,
	35,
	355,
	100000042,
	36,
	100000043,
	356,
	46,
	100000104,
	100000105,
	6,
	405,
	358,
	7,
	395,
	359,
	8,
	360,
	491,
	9,
	361,
	365,
	10,
	362,
	365,
	11,
	363,
	365,
	12,
	364,
	365,
	13,
	394,
	365,
	14,
	389,
	366,
	15,
	100000005,
	367,
	20,
	387,
	368,
	26,
	369,
	391,
	37,
	370,
	100000086,
	38,
	100000086,
	371,
	39,
	372,
	518,
	40,
	373,
	100000057,
	41,
	100000057,
	374,
	42,
	538,
	375,
	48,
	100000043,
	376,
	49,
	100000045,
	377,
	51,
	378,
	526,
	60,
	381,
	379,
	62,
	100000055,
	380,
	63,
	382,
	100000046,
	62,
	100000055,
	382,
	64,
	383,
	100000054,
	66,
	384,
	100000053,
	69,
	385,
	100000065,
	70,
	386,
	100000052,
	72,
	100000060,
	100000051,
	25,
	388,
	100000042,
	46,
	100000025,
	100000026,
	15,
	100000005,
	390,
	26,
	100000088,
	391,
	28,
	100000087,
	392,
	34,
	393,
	544,
	46,
	100000089,
	100000090,
	15,
	100000005,
	547,
	8,
	396,
	100000009,
	15,
	100000005,
	397,
	16,
	398,
	410,
	18,
	399,
	410,
	19,
	400,
	410,
	20,
	401,
	100000009,
	27,
	402,
	100000012,
	29,
	100000011,
	403,
	31,
	100000011,
	404,
	32,
	100000011,
	422,
	8,
	406,
	100000009,
	15,
	100000005,
	407,
	16,
	408,
	410,
	18,
	409,
	410,
	19,
	411,
	410,
	20,
	100000012,
	100000009,
	20,
	414,
	412,
	22,
	413,
	100000009,
	34,
	100000010,
	100000009,
	22,
	416,
	415,
	27,
	419,
	100000012,
	27,
	418,
	417,
	34,
	100000010,
	100000012,
	34,
	100000010,
	419,
	43,
	100000011,
	420,
	47,
	100000011,
	421,
	53,
	100000011,
	422,
	54,
	100000011,
	423,
	56,
	100000011,
	100000012,
	2,
	100000001,
	425,
	3,
	478,
	426,
	4,
	100000004,
	427,
	5,
	438,
	428,
	8,
	429,
	100000115,
	16,
	430,
	433,
	18,
	431,
	433,
	19,
	432,
	433,
	22,
	100000014,
	433,
	35,
	434,
	100000042,
	36,
	100000044,
	435,
	46,
	100000112,
	436,
	57,
	437,
	100000114,
	58,
	100000113,
	100000114,
	6,
	100000006,
	439,
	7,
	100000006,
	440,
	8,
	450,
	441,
	14,
	501,
	442,
	26,
	443,
	502,
	37,
	444,
	100000086,
	38,
	100000086,
	445,
	39,
	446,
	465,
	40,
	447,
	100000057,
	41,
	100000057,
	448,
	42,
	471,
	449,
	48,
	100000044,
	500,
	9,
	451,
	455,
	10,
	452,
	455,
	11,
	453,
	455,
	12,
	454,
	455,
	13,
	547,
	455,
	14,
	473,
	456,
	15,
	460,
	457,
	20,
	458,
	461,
	25,
	459,
	100000042,
	46,
	100000037,
	100000038,
	20,
	540,
	461,
	26,
	462,
	474,
	37,
	463,
	100000086,
	38,
	100000086,
	464,
	39,
	467,
	465,
	48,
	100000058,
	466,
	50,
	100000075,
	100000085,
	40,
	468,
	100000057,
	41,
	100000057,
	469,
	42,
	471,
	470,
	48,
	100000044,
	524,
	48,
	100000044,
	472,
	52,
	100000068,
	100000072,
	26,
	100000088,
	474,
	28,
	100000087,
	475,
	34,
	100000100,
	476,
	35,
	477,
	545,
	36,
	100000044,
	100000115,
	4,
	100000002,
	479,
	5,
	488,
	480,
	8,
	481,
	100000115,
	16,
	482,
	485,
	18,
	483,
	485,
	19,
	484,
	485,
	22,
	100000014,
	485,
	35,
	486,
	100000042,
	36,
	100000043,
	487,
	46,
	100000108,
	100000109,
	6,
	100000006,
	489,
	7,
	100000006,
	490,
	8,
	503,
	491,
	14,
	501,
	492,
	26,
	493,
	502,
	37,
	494,
	100000086,
	38,
	100000086,
	495,
	39,
	496,
	518,
	40,
	497,
	100000057,
	41,
	100000057,
	498,
	42,
	538,
	499,
	48,
	100000043,
	500,
	49,
	100000045,
	526,
	26,
	100000088,
	502,
	28,
	100000087,
	100000115,
	9,
	504,
	508,
	10,
	505,
	508,
	11,
	506,
	508,
	12,
	507,
	508,
	13,
	547,
	508,
	14,
	541,
	509,
	15,
	513,
	510,
	20,
	511,
	514,
	25,
	512,
	100000042,
	46,
	100000029,
	100000030,
	20,
	540,
	514,
	26,
	515,
	542,
	37,
	516,
	100000086,
	38,
	100000086,
	517,
	39,
	520,
	518,
	48,
	100000058,
	519,
	50,
	100000073,
	100000085,
	40,
	521,
	100000057,
	41,
	100000057,
	522,
	42,
	538,
	523,
	48,
	100000043,
	524,
	49,
	100000045,
	525,
	51,
	529,
	526,
	60,
	100000055,
	527,
	62,
	100000055,
	528,
	63,
	100000055,
	100000046,
	60,
	532,
	530,
	62,
	100000055,
	531,
	63,
	533,
	100000046,
	62,
	100000055,
	533,
	64,
	534,
	100000054,
	66,
	535,
	100000053,
	69,
	536,
	100000065,
	70,
	537,
	100000052,
	72,
	100000059,
	100000051,
	48,
	100000043,
	539,
	52,
	100000066,
	100000072,
	25,
	100000024,
	100000042,
	26,
	100000088,
	542,
	28,
	100000087,
	543,
	34,
	100000100,
	544,
	35,
	546,
	545,
	36,
	100000042,
	100000115,
	36,
	100000043,
	100000115,
	17,
	548,
	100000022,
	20,
	549,
	100000021,
	33,
	552,
	550,
	44,
	100000017,
	551,
	45,
	100000019,
	100000020,
	44,
	100000015,
	553,
	45,
	100000015,
	100000020
]);
var bdd = import_endpoints.BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/endpoint/endpointResolver.js
var cache = new import_endpoints.EndpointCache({
	size: 50,
	params: [
		"Accelerate",
		"Bucket",
		"DisableAccessPoints",
		"DisableMultiRegionAccessPoints",
		"DisableS3ExpressSessionAuth",
		"Endpoint",
		"ForcePathStyle",
		"Region",
		"UseArnRegion",
		"UseDualStack",
		"UseFIPS",
		"UseGlobalEndpoint",
		"UseObjectLambdaEndpoint",
		"UseS3ExpressControlEndpoint"
	]
});
var defaultEndpointResolver = (endpointParams, context = {}) => {
	return cache.get(endpointParams, () => (0, import_endpoints.decideEndpoint)(bdd, {
		endpointParams,
		logger: context.logger
	}));
};
import_endpoints.customEndpointFunctions.aws = import_client$1.awsEndpointFunctions;
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/auth/httpAuthSchemeProvider.js
var import_client = require_client();
var createEndpointRuleSetHttpAuthSchemeParametersProvider = (defaultHttpAuthSchemeParametersProvider) => async (config, context, input) => {
	if (!input) throw new Error("Could not find `input` for `defaultEndpointRuleSetHttpAuthSchemeParametersProvider`");
	const defaultParameters = await defaultHttpAuthSchemeParametersProvider(config, context, input);
	const instructionsFn = (0, import_client.getSmithyContext)(context)?.commandInstance?.constructor?.getEndpointParameterInstructions;
	if (!instructionsFn) throw new Error(`getEndpointParameterInstructions() is not defined on '${context.commandName}'`);
	const endpointParameters = await (0, import_endpoints.resolveParams)(input, { getEndpointParameterInstructions: instructionsFn }, config);
	return Object.assign(defaultParameters, endpointParameters);
};
var _defaultS3HttpAuthSchemeParametersProvider = async (config, context, input) => {
	return {
		operation: (0, import_client.getSmithyContext)(context).operation,
		region: await (0, import_client.normalizeProvider)(config.region)() || (() => {
			throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
		})()
	};
};
var defaultS3HttpAuthSchemeParametersProvider = createEndpointRuleSetHttpAuthSchemeParametersProvider(_defaultS3HttpAuthSchemeParametersProvider);
function createAwsAuthSigv4HttpAuthOption(authParameters) {
	return {
		schemeId: "aws.auth#sigv4",
		signingProperties: {
			name: "s3",
			region: authParameters.region
		},
		propertiesExtractor: (config, context) => ({ signingProperties: {
			config,
			context
		} })
	};
}
function createAwsAuthSigv4aHttpAuthOption(authParameters) {
	return {
		schemeId: "aws.auth#sigv4a",
		signingProperties: {
			name: "s3",
			region: authParameters.region
		},
		propertiesExtractor: (config, context) => ({ signingProperties: {
			config,
			context
		} })
	};
}
var createEndpointRuleSetHttpAuthSchemeProvider = (defaultEndpointResolver, defaultHttpAuthSchemeResolver, createHttpAuthOptionFunctions) => {
	const endpointRuleSetHttpAuthSchemeProvider = (authParameters) => {
		const authSchemes = defaultEndpointResolver(authParameters).properties?.authSchemes;
		if (!authSchemes) return defaultHttpAuthSchemeResolver(authParameters);
		const options = [];
		for (const scheme of authSchemes) {
			const { name: resolvedName, properties = {}, ...rest } = scheme;
			const name = resolvedName.toLowerCase();
			if (resolvedName !== name) console.warn(`HttpAuthScheme has been normalized with lowercasing: '${resolvedName}' to '${name}'`);
			let schemeId;
			if (name === "sigv4a") {
				schemeId = "aws.auth#sigv4a";
				const sigv4Present = authSchemes.find((s) => {
					const name = s.name.toLowerCase();
					return name !== "sigv4a" && name.startsWith("sigv4");
				});
				if (SignatureV4MultiRegion.sigv4aDependency() === "none" && sigv4Present) continue;
			} else if (name.startsWith("sigv4")) schemeId = "aws.auth#sigv4";
			else throw new Error(`Unknown HttpAuthScheme found in '@smithy.rules#endpointRuleSet': '${name}'`);
			const createOption = createHttpAuthOptionFunctions[schemeId];
			if (!createOption) throw new Error(`Could not find HttpAuthOption create function for '${schemeId}'`);
			const option = createOption(authParameters);
			option.schemeId = schemeId;
			option.signingProperties = {
				...option.signingProperties || {},
				...rest,
				...properties
			};
			options.push(option);
		}
		return options;
	};
	return endpointRuleSetHttpAuthSchemeProvider;
};
var _defaultS3HttpAuthSchemeProvider = (authParameters) => {
	const options = [];
	switch (authParameters.operation) {
		default:
			options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
			options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
	}
	return options;
};
var defaultS3HttpAuthSchemeProvider = createEndpointRuleSetHttpAuthSchemeProvider(defaultEndpointResolver, _defaultS3HttpAuthSchemeProvider, {
	"aws.auth#sigv4": createAwsAuthSigv4HttpAuthOption,
	"aws.auth#sigv4a": createAwsAuthSigv4aHttpAuthOption
});
var resolveHttpAuthSchemeConfig = (config) => {
	const config_0 = (0, import_httpAuthSchemes.resolveAwsSdkSigV4Config)(config);
	const config_1 = (0, import_httpAuthSchemes.resolveAwsSdkSigV4AConfig)(config_0);
	return Object.assign(config_1, { authSchemePreference: (0, import_client.normalizeProvider)(config.authSchemePreference ?? []) });
};
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/endpoint/EndpointParameters.js
var resolveClientEndpointParameters = (options) => {
	return Object.assign(options, {
		useFipsEndpoint: options.useFipsEndpoint ?? false,
		useDualstackEndpoint: options.useDualstackEndpoint ?? false,
		forcePathStyle: options.forcePathStyle ?? false,
		useAccelerateEndpoint: options.useAccelerateEndpoint ?? false,
		useGlobalEndpoint: options.useGlobalEndpoint ?? false,
		disableMultiregionAccessPoints: options.disableMultiregionAccessPoints ?? false,
		defaultSigningName: "s3",
		clientContextParams: options.clientContextParams ?? {}
	});
};
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/commandBuilder.js
var command = (0, import_client.makeBuilder)({
	ForcePathStyle: {
		type: "clientContextParams",
		name: "forcePathStyle"
	},
	UseArnRegion: {
		type: "clientContextParams",
		name: "useArnRegion"
	},
	DisableMultiRegionAccessPoints: {
		type: "clientContextParams",
		name: "disableMultiregionAccessPoints"
	},
	Accelerate: {
		type: "clientContextParams",
		name: "useAccelerateEndpoint"
	},
	DisableS3ExpressSessionAuth: {
		type: "clientContextParams",
		name: "disableS3ExpressSessionAuth"
	},
	UseGlobalEndpoint: {
		type: "builtInParams",
		name: "useGlobalEndpoint"
	},
	UseFIPS: {
		type: "builtInParams",
		name: "useFipsEndpoint"
	},
	Endpoint: {
		type: "builtInParams",
		name: "endpoint"
	},
	Region: {
		type: "builtInParams",
		name: "region"
	},
	UseDualStack: {
		type: "builtInParams",
		name: "useDualstackEndpoint"
	}
}, "AmazonS3", "S3Client", import_endpoints.getEndpointPlugin);
var _ep0 = {
	Bucket: {
		type: "contextParams",
		name: "Bucket"
	},
	Key: {
		type: "contextParams",
		name: "Key"
	}
};
var _ep4 = {
	DisableS3ExpressSessionAuth: {
		type: "staticContextParams",
		value: true
	},
	Bucket: {
		type: "contextParams",
		name: "Bucket"
	}
};
var _mw0 = (Command, cs, config, o) => [(0, import_s3.getThrow200ExceptionsPlugin)(config)];
var _mw7 = (Command, cs, config, o) => [
	(0, import_flexible_checksums.getFlexibleChecksumsPlugin)(config, {
		requestChecksumRequired: false,
		requestValidationModeMember: "ChecksumMode",
		responseAlgorithms: [
			"CRC64NVME",
			"CRC32",
			"CRC32C",
			"SHA256",
			"SHA1",
			"SHA512",
			"MD5",
			"XXHASH64",
			"XXHASH3",
			"XXHASH128"
		]
	}),
	(0, import_s3.getSsecPlugin)(config),
	(0, import_s3.getS3ExpiresMiddlewarePlugin)(config)
];
var _mw8 = (Command, cs, config, o) => [
	(0, import_s3.getThrow200ExceptionsPlugin)(config),
	(0, import_s3.getSsecPlugin)(config),
	(0, import_s3.getS3ExpiresMiddlewarePlugin)(config)
];
var _mw11 = (Command, cs, config, o) => [
	(0, import_flexible_checksums.getFlexibleChecksumsPlugin)(config, {
		requestAlgorithmMember: {
			"httpHeader": "x-amz-sdk-checksum-algorithm",
			"name": "ChecksumAlgorithm"
		},
		requestChecksumRequired: false
	}),
	(0, import_s3.getCheckContentLengthHeaderPlugin)(config),
	(0, import_s3.getThrow200ExceptionsPlugin)(config),
	(0, import_s3.getSsecPlugin)(config)
];
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/models/S3ServiceException.js
var S3ServiceException = class S3ServiceException extends import_client.ServiceException {
	constructor(options) {
		super(options);
		Object.setPrototypeOf(this, S3ServiceException.prototype);
	}
};
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/models/errors.js
var NoSuchUpload = class NoSuchUpload extends S3ServiceException {
	name = "NoSuchUpload";
	$fault = "client";
	constructor(opts) {
		super({
			name: "NoSuchUpload",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, NoSuchUpload.prototype);
	}
};
var AccessDenied = class AccessDenied extends S3ServiceException {
	name = "AccessDenied";
	$fault = "client";
	constructor(opts) {
		super({
			name: "AccessDenied",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, AccessDenied.prototype);
	}
};
var ObjectNotInActiveTierError = class ObjectNotInActiveTierError extends S3ServiceException {
	name = "ObjectNotInActiveTierError";
	$fault = "client";
	constructor(opts) {
		super({
			name: "ObjectNotInActiveTierError",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, ObjectNotInActiveTierError.prototype);
	}
};
var BucketAlreadyExists = class BucketAlreadyExists extends S3ServiceException {
	name = "BucketAlreadyExists";
	$fault = "client";
	constructor(opts) {
		super({
			name: "BucketAlreadyExists",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, BucketAlreadyExists.prototype);
	}
};
var BucketAlreadyOwnedByYou = class BucketAlreadyOwnedByYou extends S3ServiceException {
	name = "BucketAlreadyOwnedByYou";
	$fault = "client";
	constructor(opts) {
		super({
			name: "BucketAlreadyOwnedByYou",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, BucketAlreadyOwnedByYou.prototype);
	}
};
var NoSuchBucket = class NoSuchBucket extends S3ServiceException {
	name = "NoSuchBucket";
	$fault = "client";
	constructor(opts) {
		super({
			name: "NoSuchBucket",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, NoSuchBucket.prototype);
	}
};
var NoSuchKey = class NoSuchKey extends S3ServiceException {
	name = "NoSuchKey";
	$fault = "client";
	constructor(opts) {
		super({
			name: "NoSuchKey",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, NoSuchKey.prototype);
	}
};
var InvalidObjectState = class InvalidObjectState extends S3ServiceException {
	name = "InvalidObjectState";
	$fault = "client";
	StorageClass;
	AccessTier;
	constructor(opts) {
		super({
			name: "InvalidObjectState",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidObjectState.prototype);
		this.StorageClass = opts.StorageClass;
		this.AccessTier = opts.AccessTier;
	}
};
var NoSuchAnnotation = class NoSuchAnnotation extends S3ServiceException {
	name = "NoSuchAnnotation";
	$fault = "client";
	constructor(opts) {
		super({
			name: "NoSuchAnnotation",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, NoSuchAnnotation.prototype);
	}
};
var NotFound = class NotFound extends S3ServiceException {
	name = "NotFound";
	$fault = "client";
	constructor(opts) {
		super({
			name: "NotFound",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, NotFound.prototype);
	}
};
var InvalidPrefix = class InvalidPrefix extends S3ServiceException {
	name = "InvalidPrefix";
	$fault = "client";
	constructor(opts) {
		super({
			name: "InvalidPrefix",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidPrefix.prototype);
	}
};
var EncryptionTypeMismatch = class EncryptionTypeMismatch extends S3ServiceException {
	name = "EncryptionTypeMismatch";
	$fault = "client";
	constructor(opts) {
		super({
			name: "EncryptionTypeMismatch",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, EncryptionTypeMismatch.prototype);
	}
};
var InvalidRequest = class InvalidRequest extends S3ServiceException {
	name = "InvalidRequest";
	$fault = "client";
	constructor(opts) {
		super({
			name: "InvalidRequest",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidRequest.prototype);
	}
};
var InvalidWriteOffset = class InvalidWriteOffset extends S3ServiceException {
	name = "InvalidWriteOffset";
	$fault = "client";
	constructor(opts) {
		super({
			name: "InvalidWriteOffset",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidWriteOffset.prototype);
	}
};
var TooManyParts = class TooManyParts extends S3ServiceException {
	name = "TooManyParts";
	$fault = "client";
	constructor(opts) {
		super({
			name: "TooManyParts",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, TooManyParts.prototype);
	}
};
var AnnotationLimitExceeded = class AnnotationLimitExceeded extends S3ServiceException {
	name = "AnnotationLimitExceeded";
	$fault = "client";
	constructor(opts) {
		super({
			name: "AnnotationLimitExceeded",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, AnnotationLimitExceeded.prototype);
	}
};
var AnnotationNameTooLong = class AnnotationNameTooLong extends S3ServiceException {
	name = "AnnotationNameTooLong";
	$fault = "client";
	constructor(opts) {
		super({
			name: "AnnotationNameTooLong",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, AnnotationNameTooLong.prototype);
	}
};
var InvalidAnnotationName = class InvalidAnnotationName extends S3ServiceException {
	name = "InvalidAnnotationName";
	$fault = "client";
	constructor(opts) {
		super({
			name: "InvalidAnnotationName",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidAnnotationName.prototype);
	}
};
var UnsupportedMediaType = class UnsupportedMediaType extends S3ServiceException {
	name = "UnsupportedMediaType";
	$fault = "client";
	constructor(opts) {
		super({
			name: "UnsupportedMediaType",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, UnsupportedMediaType.prototype);
	}
};
var IdempotencyParameterMismatch = class IdempotencyParameterMismatch extends S3ServiceException {
	name = "IdempotencyParameterMismatch";
	$fault = "client";
	constructor(opts) {
		super({
			name: "IdempotencyParameterMismatch",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, IdempotencyParameterMismatch.prototype);
	}
};
var ObjectAlreadyInActiveTierError = class ObjectAlreadyInActiveTierError extends S3ServiceException {
	name = "ObjectAlreadyInActiveTierError";
	$fault = "client";
	constructor(opts) {
		super({
			name: "ObjectAlreadyInActiveTierError",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, ObjectAlreadyInActiveTierError.prototype);
	}
};
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/schemas/schemas_0.js
var _ACL_ = "ACL";
var _AD = "AccessDenied";
var _AKI = "AccessKeyId";
var _ALE = "AnnotationLimitExceeded";
var _ANTL = "AnnotationNameTooLong";
var _AR = "AcceptRanges";
var _ASr = "ArchiveStatus";
var _AT = "AccessTier";
var _B = "Bucket";
var _BAE = "BucketAlreadyExists";
var _BAOBY = "BucketAlreadyOwnedByYou";
var _BGR = "BypassGovernanceRetention";
var _BKE = "BucketKeyEnabled";
var _Bo = "Body";
var _CA = "ChecksumAlgorithm";
var _CC = "CacheControl";
var _CCRC = "ChecksumCRC32";
var _CCRCC = "ChecksumCRC32C";
var _CCRCNVME = "ChecksumCRC64NVME";
var _CC_ = "Cache-Control";
var _CD_ = "Content-Disposition";
var _CDo = "ContentDisposition";
var _CE_ = "Content-Encoding";
var _CEo = "ContentEncoding";
var _CL = "ContentLanguage";
var _CL_ = "Content-Language";
var _CL__ = "Content-Length";
var _CLo = "ContentLength";
var _CM = "Content-MD5";
var _CMD = "ChecksumMD5";
var _CMDo = "ContentMD5";
var _CMh = "ChecksumMode";
var _CR = "ContentRange";
var _CR_ = "Content-Range";
var _CSHA = "ChecksumSHA1";
var _CSHAh = "ChecksumSHA256";
var _CSHAhe = "ChecksumSHA512";
var _CSO = "CreateSessionOutput";
var _CSR = "CreateSessionResult";
var _CSRr = "CreateSessionRequest";
var _CSr = "CreateSession";
var _CT = "ChecksumType";
var _CT_ = "Content-Type";
var _CTo = "ContentType";
var _CXXHASH = "ChecksumXXHASH64";
var _CXXHASHh = "ChecksumXXHASH3";
var _CXXHASHhe = "ChecksumXXHASH128";
var _Cr = "Credentials";
var _DM = "DeleteMarker";
var _DOO = "DeleteObjectOutput";
var _DOR = "DeleteObjectRequest";
var _DOel = "DeleteObject";
var _EBO = "ExpectedBucketOwner";
var _ES = "ExpiresString";
var _ET = "ETag";
var _ETM = "EncryptionTypeMismatch";
var _Ex = "Expiration";
var _Exp = "Expires";
var _GFC = "GrantFullControl";
var _GO = "GetObject";
var _GOO = "GetObjectOutput";
var _GOR = "GetObjectRequest";
var _GR = "GrantRead";
var _GRACP = "GrantReadACP";
var _GWACP = "GrantWriteACP";
var _HO = "HeadObject";
var _HOO = "HeadObjectOutput";
var _HOR = "HeadObjectRequest";
var _IAN = "InvalidAnnotationName";
var _IM = "IfMatch";
var _IMLMT = "IfMatchLastModifiedTime";
var _IMS = "IfMatchSize";
var _IMS_ = "If-Modified-Since";
var _IMSf = "IfModifiedSince";
var _IM_ = "If-Match";
var _INM = "IfNoneMatch";
var _INM_ = "If-None-Match";
var _IOS = "InvalidObjectState";
var _IP = "InvalidPrefix";
var _IPM = "IdempotencyParameterMismatch";
var _IR = "InvalidRequest";
var _IUS = "IfUnmodifiedSince";
var _IUS_ = "If-Unmodified-Since";
var _IWO = "InvalidWriteOffset";
var _K = "Key";
var _LM = "LastModified";
var _LM_ = "Last-Modified";
var _M = "Metadata";
var _MFA = "MFA";
var _MM = "MissingMeta";
var _NF = "NotFound";
var _NSA = "NoSuchAnnotation";
var _NSB = "NoSuchBucket";
var _NSK = "NoSuchKey";
var _NSU = "NoSuchUpload";
var _OAIATE = "ObjectAlreadyInActiveTierError";
var _OLEH = "ObjectLockEventHold";
var _OLEHDD = "ObjectLockEventHoldDurationDays";
var _OLEHDY = "ObjectLockEventHoldDurationYears";
var _OLLHS = "ObjectLockLegalHoldStatus";
var _OLM = "ObjectLockMode";
var _OLRUD = "ObjectLockRetainUntilDate";
var _ONIATE = "ObjectNotInActiveTierError";
var _PC = "PartsCount";
var _PN = "PartNumber";
var _PO = "PutObject";
var _POO = "PutObjectOutput";
var _POR = "PutObjectRequest";
var _RC = "RequestCharged";
var _RCC = "ResponseCacheControl";
var _RCD = "ResponseContentDisposition";
var _RCE = "ResponseContentEncoding";
var _RCL = "ResponseContentLanguage";
var _RCT = "ResponseContentType";
var _RE = "ResponseExpires";
var _RP = "RequestPayer";
var _RS = "ReplicationStatus";
var _Ra = "Range";
var _Re = "Restore";
var _SAK = "SecretAccessKey";
var _SB = "StreamingBlob";
var _SC = "StorageClass";
var _SCV = "SessionCredentialValue";
var _SCe = "SessionCredentials";
var _SM = "SessionMode";
var _SSE = "ServerSideEncryption";
var _SSECA = "SSECustomerAlgorithm";
var _SSECK = "SSECustomerKey";
var _SSECKMD = "SSECustomerKeyMD5";
var _SSEKMSEC = "SSEKMSEncryptionContext";
var _SSEKMSKI = "SSEKMSKeyId";
var _ST = "SessionToken";
var _Si = "Size";
var _TC = "TagCount";
var _TMP = "TooManyParts";
var _Tag = "Tagging";
var _UMT = "UnsupportedMediaType";
var _VI = "VersionId";
var _WOB = "WriteOffsetBytes";
var _WRL = "WebsiteRedirectLocation";
var _ar = "accept-ranges";
var _c = "client";
var _e = "error";
var _h = "http";
var _hC = "httpChecksum";
var _hE = "httpError";
var _hH = "httpHeader";
var _hPH = "httpPrefixHeaders";
var _hQ = "httpQuery";
var _pN = "partNumber";
var _rcc = "response-cache-control";
var _rcd = "response-content-disposition";
var _rce = "response-content-encoding";
var _rcl = "response-content-language";
var _rct = "response-content-type";
var _re = "response-expires";
var _s = "smithy.ts.sdk.synthetic.com.amazonaws.s3";
var _st = "streaming";
var _vI = "versionId";
var _xN = "xmlName";
var _xaa = "x-amz-acl";
var _xaas = "x-amz-archive-status";
var _xabgr = "x-amz-bypass-governance-retention";
var _xacc = "x-amz-checksum-crc32";
var _xacc_ = "x-amz-checksum-crc32c";
var _xacc__ = "x-amz-checksum-crc64nvme";
var _xacm = "x-amz-checksum-md5";
var _xacm_ = "x-amz-checksum-mode";
var _xacs = "x-amz-checksum-sha1";
var _xacs_ = "x-amz-checksum-sha256";
var _xacs__ = "x-amz-checksum-sha512";
var _xacsm = "x-amz-create-session-mode";
var _xact = "x-amz-checksum-type";
var _xacx = "x-amz-checksum-xxhash64";
var _xacx_ = "x-amz-checksum-xxhash3";
var _xacx__ = "x-amz-checksum-xxhash128";
var _xadm = "x-amz-delete-marker";
var _xae = "x-amz-expiration";
var _xaebo = "x-amz-expected-bucket-owner";
var _xagfc = "x-amz-grant-full-control";
var _xagr = "x-amz-grant-read";
var _xagra = "x-amz-grant-read-acp";
var _xagwa = "x-amz-grant-write-acp";
var _xaimlmt = "x-amz-if-match-last-modified-time";
var _xaims = "x-amz-if-match-size";
var _xam = "x-amz-meta-";
var _xam_ = "x-amz-mfa";
var _xamm = "x-amz-missing-meta";
var _xampc = "x-amz-mp-parts-count";
var _xaoleh = "x-amz-object-lock-event-hold";
var _xaolehdd = "x-amz-object-lock-event-hold-duration-days";
var _xaolehdy = "x-amz-object-lock-event-hold-duration-years";
var _xaollh = "x-amz-object-lock-legal-hold";
var _xaolm = "x-amz-object-lock-mode";
var _xaolrud = "x-amz-object-lock-retain-until-date";
var _xaos = "x-amz-object-size";
var _xar = "x-amz-restore";
var _xarc = "x-amz-request-charged";
var _xarp = "x-amz-request-payer";
var _xars = "x-amz-replication-status";
var _xasc = "x-amz-storage-class";
var _xasca = "x-amz-sdk-checksum-algorithm";
var _xasse = "x-amz-server-side-encryption";
var _xasseakki = "x-amz-server-side-encryption-aws-kms-key-id";
var _xassebke = "x-amz-server-side-encryption-bucket-key-enabled";
var _xassec = "x-amz-server-side-encryption-context";
var _xasseca = "x-amz-server-side-encryption-customer-algorithm";
var _xasseck = "x-amz-server-side-encryption-customer-key";
var _xasseckM = "x-amz-server-side-encryption-customer-key-MD5";
var _xat = "x-amz-tagging";
var _xatc = "x-amz-tagging-count";
var _xavi = "x-amz-version-id";
var _xawob = "x-amz-write-offset-bytes";
var _xawrl = "x-amz-website-redirect-location";
var n0 = "com.amazonaws.s3";
var _s_registry = new import_schema.TypeRegistry(_s);
var S3ServiceException$ = [
	-3,
	_s,
	"S3ServiceException",
	0,
	[],
	[]
];
_s_registry.registerError(S3ServiceException$, S3ServiceException);
var n0_registry = new import_schema.TypeRegistry(n0);
var AccessDenied$ = [
	-3,
	n0,
	_AD,
	{
		[_e]: _c,
		[_hE]: 403
	},
	[],
	[]
];
n0_registry.registerError(AccessDenied$, AccessDenied);
var AnnotationLimitExceeded$ = [
	-3,
	n0,
	_ALE,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[],
	[]
];
n0_registry.registerError(AnnotationLimitExceeded$, AnnotationLimitExceeded);
var AnnotationNameTooLong$ = [
	-3,
	n0,
	_ANTL,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[],
	[]
];
n0_registry.registerError(AnnotationNameTooLong$, AnnotationNameTooLong);
var BucketAlreadyExists$ = [
	-3,
	n0,
	_BAE,
	{
		[_e]: _c,
		[_hE]: 409
	},
	[],
	[]
];
n0_registry.registerError(BucketAlreadyExists$, BucketAlreadyExists);
var BucketAlreadyOwnedByYou$ = [
	-3,
	n0,
	_BAOBY,
	{
		[_e]: _c,
		[_hE]: 409
	},
	[],
	[]
];
n0_registry.registerError(BucketAlreadyOwnedByYou$, BucketAlreadyOwnedByYou);
var EncryptionTypeMismatch$ = [
	-3,
	n0,
	_ETM,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[],
	[]
];
n0_registry.registerError(EncryptionTypeMismatch$, EncryptionTypeMismatch);
var IdempotencyParameterMismatch$ = [
	-3,
	n0,
	_IPM,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[],
	[]
];
n0_registry.registerError(IdempotencyParameterMismatch$, IdempotencyParameterMismatch);
var InvalidAnnotationName$ = [
	-3,
	n0,
	_IAN,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[],
	[]
];
n0_registry.registerError(InvalidAnnotationName$, InvalidAnnotationName);
var InvalidObjectState$ = [
	-3,
	n0,
	_IOS,
	{
		[_e]: _c,
		[_hE]: 403
	},
	[_SC, _AT],
	[0, 0]
];
n0_registry.registerError(InvalidObjectState$, InvalidObjectState);
var InvalidPrefix$ = [
	-3,
	n0,
	_IP,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[],
	[]
];
n0_registry.registerError(InvalidPrefix$, InvalidPrefix);
var InvalidRequest$ = [
	-3,
	n0,
	_IR,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[],
	[]
];
n0_registry.registerError(InvalidRequest$, InvalidRequest);
var InvalidWriteOffset$ = [
	-3,
	n0,
	_IWO,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[],
	[]
];
n0_registry.registerError(InvalidWriteOffset$, InvalidWriteOffset);
var NoSuchAnnotation$ = [
	-3,
	n0,
	_NSA,
	{
		[_e]: _c,
		[_hE]: 404
	},
	[],
	[]
];
n0_registry.registerError(NoSuchAnnotation$, NoSuchAnnotation);
var NoSuchBucket$ = [
	-3,
	n0,
	_NSB,
	{
		[_e]: _c,
		[_hE]: 404
	},
	[],
	[]
];
n0_registry.registerError(NoSuchBucket$, NoSuchBucket);
var NoSuchKey$ = [
	-3,
	n0,
	_NSK,
	{
		[_e]: _c,
		[_hE]: 404
	},
	[],
	[]
];
n0_registry.registerError(NoSuchKey$, NoSuchKey);
var NoSuchUpload$ = [
	-3,
	n0,
	_NSU,
	{
		[_e]: _c,
		[_hE]: 404
	},
	[],
	[]
];
n0_registry.registerError(NoSuchUpload$, NoSuchUpload);
var NotFound$ = [
	-3,
	n0,
	_NF,
	{ [_e]: _c },
	[],
	[]
];
n0_registry.registerError(NotFound$, NotFound);
var ObjectAlreadyInActiveTierError$ = [
	-3,
	n0,
	_OAIATE,
	{
		[_e]: _c,
		[_hE]: 403
	},
	[],
	[]
];
n0_registry.registerError(ObjectAlreadyInActiveTierError$, ObjectAlreadyInActiveTierError);
var ObjectNotInActiveTierError$ = [
	-3,
	n0,
	_ONIATE,
	{
		[_e]: _c,
		[_hE]: 403
	},
	[],
	[]
];
n0_registry.registerError(ObjectNotInActiveTierError$, ObjectNotInActiveTierError);
var TooManyParts$ = [
	-3,
	n0,
	_TMP,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[],
	[]
];
n0_registry.registerError(TooManyParts$, TooManyParts);
var UnsupportedMediaType$ = [
	-3,
	n0,
	_UMT,
	{
		[_e]: _c,
		[_hE]: 415
	},
	[],
	[]
];
n0_registry.registerError(UnsupportedMediaType$, UnsupportedMediaType);
var errorTypeRegistries = [_s_registry, n0_registry];
var SessionCredentialValue = [
	0,
	n0,
	_SCV,
	8,
	0
];
var SSECustomerKey = [
	0,
	n0,
	_SSECK,
	8,
	0
];
var SSEKMSEncryptionContext = [
	0,
	n0,
	_SSEKMSEC,
	8,
	0
];
var SSEKMSKeyId = [
	0,
	n0,
	_SSEKMSKI,
	8,
	0
];
var StreamingBlob = [
	0,
	n0,
	_SB,
	{ [_st]: 1 },
	42
];
var CreateSessionOutput$ = [
	3,
	n0,
	_CSO,
	{ [_xN]: _CSR },
	[
		_Cr,
		_SSE,
		_SSEKMSKI,
		_SSEKMSEC,
		_BKE
	],
	[
		[() => SessionCredentials$, { [_xN]: _Cr }],
		[0, { [_hH]: _xasse }],
		[() => SSEKMSKeyId, { [_hH]: _xasseakki }],
		[() => SSEKMSEncryptionContext, { [_hH]: _xassec }],
		[2, { [_hH]: _xassebke }]
	],
	1
];
var CreateSessionRequest$ = [
	3,
	n0,
	_CSRr,
	0,
	[
		_B,
		_SM,
		_SSE,
		_SSEKMSKI,
		_SSEKMSEC,
		_BKE
	],
	[
		[0, 1],
		[0, { [_hH]: _xacsm }],
		[0, { [_hH]: _xasse }],
		[() => SSEKMSKeyId, { [_hH]: _xasseakki }],
		[() => SSEKMSEncryptionContext, { [_hH]: _xassec }],
		[2, { [_hH]: _xassebke }]
	],
	1
];
var DeleteObjectOutput$ = [
	3,
	n0,
	_DOO,
	0,
	[
		_DM,
		_VI,
		_RC
	],
	[
		[2, { [_hH]: _xadm }],
		[0, { [_hH]: _xavi }],
		[0, { [_hH]: _xarc }]
	]
];
var DeleteObjectRequest$ = [
	3,
	n0,
	_DOR,
	0,
	[
		_B,
		_K,
		_MFA,
		_VI,
		_RP,
		_BGR,
		_EBO,
		_IM,
		_IMLMT,
		_IMS
	],
	[
		[0, 1],
		[0, 1],
		[0, { [_hH]: _xam_ }],
		[0, { [_hQ]: _vI }],
		[0, { [_hH]: _xarp }],
		[2, { [_hH]: _xabgr }],
		[0, { [_hH]: _xaebo }],
		[0, { [_hH]: _IM_ }],
		[6, { [_hH]: _xaimlmt }],
		[1, { [_hH]: _xaims }]
	],
	2
];
var GetObjectOutput$ = [
	3,
	n0,
	_GOO,
	0,
	[
		_Bo,
		_DM,
		_AR,
		_Ex,
		_Re,
		_LM,
		_CLo,
		_ET,
		_CCRC,
		_CCRCC,
		_CCRCNVME,
		_CSHA,
		_CSHAh,
		_CSHAhe,
		_CMD,
		_CXXHASH,
		_CXXHASHh,
		_CXXHASHhe,
		_CT,
		_MM,
		_VI,
		_CC,
		_CDo,
		_CEo,
		_CL,
		_CR,
		_CTo,
		_Exp,
		_ES,
		_WRL,
		_SSE,
		_M,
		_SSECA,
		_SSECKMD,
		_SSEKMSKI,
		_BKE,
		_SC,
		_RC,
		_RS,
		_PC,
		_TC,
		_OLM,
		_OLRUD,
		_OLLHS,
		_OLEH,
		_OLEHDD,
		_OLEHDY
	],
	[
		[() => StreamingBlob, 16],
		[2, { [_hH]: _xadm }],
		[0, { [_hH]: _ar }],
		[0, { [_hH]: _xae }],
		[0, { [_hH]: _xar }],
		[4, { [_hH]: _LM_ }],
		[1, { [_hH]: _CL__ }],
		[0, { [_hH]: _ET }],
		[0, { [_hH]: _xacc }],
		[0, { [_hH]: _xacc_ }],
		[0, { [_hH]: _xacc__ }],
		[0, { [_hH]: _xacs }],
		[0, { [_hH]: _xacs_ }],
		[0, { [_hH]: _xacs__ }],
		[0, { [_hH]: _xacm }],
		[0, { [_hH]: _xacx }],
		[0, { [_hH]: _xacx_ }],
		[0, { [_hH]: _xacx__ }],
		[0, { [_hH]: _xact }],
		[1, { [_hH]: _xamm }],
		[0, { [_hH]: _xavi }],
		[0, { [_hH]: _CC_ }],
		[0, { [_hH]: _CD_ }],
		[0, { [_hH]: _CE_ }],
		[0, { [_hH]: _CL_ }],
		[0, { [_hH]: _CR_ }],
		[0, { [_hH]: _CT_ }],
		[4, { [_hH]: _Exp }],
		[0, { [_hH]: _ES }],
		[0, { [_hH]: _xawrl }],
		[0, { [_hH]: _xasse }],
		[128, { [_hPH]: _xam }],
		[0, { [_hH]: _xasseca }],
		[0, { [_hH]: _xasseckM }],
		[() => SSEKMSKeyId, { [_hH]: _xasseakki }],
		[2, { [_hH]: _xassebke }],
		[0, { [_hH]: _xasc }],
		[0, { [_hH]: _xarc }],
		[0, { [_hH]: _xars }],
		[1, { [_hH]: _xampc }],
		[1, { [_hH]: _xatc }],
		[0, { [_hH]: _xaolm }],
		[5, { [_hH]: _xaolrud }],
		[0, { [_hH]: _xaollh }],
		[0, { [_hH]: _xaoleh }],
		[1, { [_hH]: _xaolehdd }],
		[1, { [_hH]: _xaolehdy }]
	]
];
var GetObjectRequest$ = [
	3,
	n0,
	_GOR,
	0,
	[
		_B,
		_K,
		_IM,
		_IMSf,
		_INM,
		_IUS,
		_Ra,
		_RCC,
		_RCD,
		_RCE,
		_RCL,
		_RCT,
		_RE,
		_VI,
		_SSECA,
		_SSECK,
		_SSECKMD,
		_RP,
		_PN,
		_EBO,
		_CMh
	],
	[
		[0, 1],
		[0, 1],
		[0, { [_hH]: _IM_ }],
		[4, { [_hH]: _IMS_ }],
		[0, { [_hH]: _INM_ }],
		[4, { [_hH]: _IUS_ }],
		[0, { [_hH]: _Ra }],
		[0, { [_hQ]: _rcc }],
		[0, { [_hQ]: _rcd }],
		[0, { [_hQ]: _rce }],
		[0, { [_hQ]: _rcl }],
		[0, { [_hQ]: _rct }],
		[6, { [_hQ]: _re }],
		[0, { [_hQ]: _vI }],
		[0, { [_hH]: _xasseca }],
		[() => SSECustomerKey, { [_hH]: _xasseck }],
		[0, { [_hH]: _xasseckM }],
		[0, { [_hH]: _xarp }],
		[1, { [_hQ]: _pN }],
		[0, { [_hH]: _xaebo }],
		[0, { [_hH]: _xacm_ }]
	],
	2
];
var HeadObjectOutput$ = [
	3,
	n0,
	_HOO,
	0,
	[
		_DM,
		_AR,
		_Ex,
		_Re,
		_ASr,
		_LM,
		_CLo,
		_CCRC,
		_CCRCC,
		_CCRCNVME,
		_CSHA,
		_CSHAh,
		_CSHAhe,
		_CMD,
		_CXXHASH,
		_CXXHASHh,
		_CXXHASHhe,
		_CT,
		_ET,
		_MM,
		_VI,
		_CC,
		_CDo,
		_CEo,
		_CL,
		_CTo,
		_CR,
		_Exp,
		_ES,
		_WRL,
		_SSE,
		_M,
		_SSECA,
		_SSECKMD,
		_SSEKMSKI,
		_BKE,
		_SC,
		_RC,
		_RS,
		_PC,
		_TC,
		_OLM,
		_OLRUD,
		_OLLHS,
		_OLEH,
		_OLEHDD,
		_OLEHDY
	],
	[
		[2, { [_hH]: _xadm }],
		[0, { [_hH]: _ar }],
		[0, { [_hH]: _xae }],
		[0, { [_hH]: _xar }],
		[0, { [_hH]: _xaas }],
		[4, { [_hH]: _LM_ }],
		[1, { [_hH]: _CL__ }],
		[0, { [_hH]: _xacc }],
		[0, { [_hH]: _xacc_ }],
		[0, { [_hH]: _xacc__ }],
		[0, { [_hH]: _xacs }],
		[0, { [_hH]: _xacs_ }],
		[0, { [_hH]: _xacs__ }],
		[0, { [_hH]: _xacm }],
		[0, { [_hH]: _xacx }],
		[0, { [_hH]: _xacx_ }],
		[0, { [_hH]: _xacx__ }],
		[0, { [_hH]: _xact }],
		[0, { [_hH]: _ET }],
		[1, { [_hH]: _xamm }],
		[0, { [_hH]: _xavi }],
		[0, { [_hH]: _CC_ }],
		[0, { [_hH]: _CD_ }],
		[0, { [_hH]: _CE_ }],
		[0, { [_hH]: _CL_ }],
		[0, { [_hH]: _CT_ }],
		[0, { [_hH]: _CR_ }],
		[4, { [_hH]: _Exp }],
		[0, { [_hH]: _ES }],
		[0, { [_hH]: _xawrl }],
		[0, { [_hH]: _xasse }],
		[128, { [_hPH]: _xam }],
		[0, { [_hH]: _xasseca }],
		[0, { [_hH]: _xasseckM }],
		[() => SSEKMSKeyId, { [_hH]: _xasseakki }],
		[2, { [_hH]: _xassebke }],
		[0, { [_hH]: _xasc }],
		[0, { [_hH]: _xarc }],
		[0, { [_hH]: _xars }],
		[1, { [_hH]: _xampc }],
		[1, { [_hH]: _xatc }],
		[0, { [_hH]: _xaolm }],
		[5, { [_hH]: _xaolrud }],
		[0, { [_hH]: _xaollh }],
		[0, { [_hH]: _xaoleh }],
		[1, { [_hH]: _xaolehdd }],
		[1, { [_hH]: _xaolehdy }]
	]
];
var HeadObjectRequest$ = [
	3,
	n0,
	_HOR,
	0,
	[
		_B,
		_K,
		_IM,
		_IMSf,
		_INM,
		_IUS,
		_Ra,
		_RCC,
		_RCD,
		_RCE,
		_RCL,
		_RCT,
		_RE,
		_VI,
		_SSECA,
		_SSECK,
		_SSECKMD,
		_RP,
		_PN,
		_EBO,
		_CMh
	],
	[
		[0, 1],
		[0, 1],
		[0, { [_hH]: _IM_ }],
		[4, { [_hH]: _IMS_ }],
		[0, { [_hH]: _INM_ }],
		[4, { [_hH]: _IUS_ }],
		[0, { [_hH]: _Ra }],
		[0, { [_hQ]: _rcc }],
		[0, { [_hQ]: _rcd }],
		[0, { [_hQ]: _rce }],
		[0, { [_hQ]: _rcl }],
		[0, { [_hQ]: _rct }],
		[6, { [_hQ]: _re }],
		[0, { [_hQ]: _vI }],
		[0, { [_hH]: _xasseca }],
		[() => SSECustomerKey, { [_hH]: _xasseck }],
		[0, { [_hH]: _xasseckM }],
		[0, { [_hH]: _xarp }],
		[1, { [_hQ]: _pN }],
		[0, { [_hH]: _xaebo }],
		[0, { [_hH]: _xacm_ }]
	],
	2
];
var PutObjectOutput$ = [
	3,
	n0,
	_POO,
	0,
	[
		_Ex,
		_ET,
		_CCRC,
		_CCRCC,
		_CCRCNVME,
		_CSHA,
		_CSHAh,
		_CSHAhe,
		_CMD,
		_CXXHASH,
		_CXXHASHh,
		_CXXHASHhe,
		_CT,
		_SSE,
		_VI,
		_SSECA,
		_SSECKMD,
		_SSEKMSKI,
		_SSEKMSEC,
		_BKE,
		_Si,
		_RC
	],
	[
		[0, { [_hH]: _xae }],
		[0, { [_hH]: _ET }],
		[0, { [_hH]: _xacc }],
		[0, { [_hH]: _xacc_ }],
		[0, { [_hH]: _xacc__ }],
		[0, { [_hH]: _xacs }],
		[0, { [_hH]: _xacs_ }],
		[0, { [_hH]: _xacs__ }],
		[0, { [_hH]: _xacm }],
		[0, { [_hH]: _xacx }],
		[0, { [_hH]: _xacx_ }],
		[0, { [_hH]: _xacx__ }],
		[0, { [_hH]: _xact }],
		[0, { [_hH]: _xasse }],
		[0, { [_hH]: _xavi }],
		[0, { [_hH]: _xasseca }],
		[0, { [_hH]: _xasseckM }],
		[() => SSEKMSKeyId, { [_hH]: _xasseakki }],
		[() => SSEKMSEncryptionContext, { [_hH]: _xassec }],
		[2, { [_hH]: _xassebke }],
		[1, { [_hH]: _xaos }],
		[0, { [_hH]: _xarc }]
	]
];
var PutObjectRequest$ = [
	3,
	n0,
	_POR,
	0,
	[
		_B,
		_K,
		_ACL_,
		_Bo,
		_CC,
		_CDo,
		_CEo,
		_CL,
		_CLo,
		_CMDo,
		_CTo,
		_CA,
		_CCRC,
		_CCRCC,
		_CCRCNVME,
		_CSHA,
		_CSHAh,
		_CSHAhe,
		_CMD,
		_CXXHASH,
		_CXXHASHh,
		_CXXHASHhe,
		_Exp,
		_IM,
		_INM,
		_GFC,
		_GR,
		_GRACP,
		_GWACP,
		_WOB,
		_M,
		_SSE,
		_SC,
		_WRL,
		_SSECA,
		_SSECK,
		_SSECKMD,
		_SSEKMSKI,
		_SSEKMSEC,
		_BKE,
		_RP,
		_Tag,
		_OLM,
		_OLRUD,
		_OLLHS,
		_OLEH,
		_OLEHDD,
		_OLEHDY,
		_EBO
	],
	[
		[0, 1],
		[0, 1],
		[0, { [_hH]: _xaa }],
		[() => StreamingBlob, 16],
		[0, { [_hH]: _CC_ }],
		[0, { [_hH]: _CD_ }],
		[0, { [_hH]: _CE_ }],
		[0, { [_hH]: _CL_ }],
		[1, { [_hH]: _CL__ }],
		[0, { [_hH]: _CM }],
		[0, { [_hH]: _CT_ }],
		[0, { [_hH]: _xasca }],
		[0, { [_hH]: _xacc }],
		[0, { [_hH]: _xacc_ }],
		[0, { [_hH]: _xacc__ }],
		[0, { [_hH]: _xacs }],
		[0, { [_hH]: _xacs_ }],
		[0, { [_hH]: _xacs__ }],
		[0, { [_hH]: _xacm }],
		[0, { [_hH]: _xacx }],
		[0, { [_hH]: _xacx_ }],
		[0, { [_hH]: _xacx__ }],
		[4, { [_hH]: _Exp }],
		[0, { [_hH]: _IM_ }],
		[0, { [_hH]: _INM_ }],
		[0, { [_hH]: _xagfc }],
		[0, { [_hH]: _xagr }],
		[0, { [_hH]: _xagra }],
		[0, { [_hH]: _xagwa }],
		[1, { [_hH]: _xawob }],
		[128, { [_hPH]: _xam }],
		[0, { [_hH]: _xasse }],
		[0, { [_hH]: _xasc }],
		[0, { [_hH]: _xawrl }],
		[0, { [_hH]: _xasseca }],
		[() => SSECustomerKey, { [_hH]: _xasseck }],
		[0, { [_hH]: _xasseckM }],
		[() => SSEKMSKeyId, { [_hH]: _xasseakki }],
		[() => SSEKMSEncryptionContext, { [_hH]: _xassec }],
		[2, { [_hH]: _xassebke }],
		[0, { [_hH]: _xarp }],
		[0, { [_hH]: _xat }],
		[0, { [_hH]: _xaolm }],
		[5, { [_hH]: _xaolrud }],
		[0, { [_hH]: _xaollh }],
		[0, { [_hH]: _xaoleh }],
		[1, { [_hH]: _xaolehdd }],
		[1, { [_hH]: _xaolehdy }],
		[0, { [_hH]: _xaebo }]
	],
	2
];
var SessionCredentials$ = [
	3,
	n0,
	_SCe,
	0,
	[
		_AKI,
		_SAK,
		_ST,
		_Ex
	],
	[
		[0, { [_xN]: _AKI }],
		[() => SessionCredentialValue, { [_xN]: _SAK }],
		[() => SessionCredentialValue, { [_xN]: _ST }],
		[4, { [_xN]: _Ex }]
	],
	4
];
var CreateSession$ = [
	9,
	n0,
	_CSr,
	{ [_h]: [
		"GET",
		"/?session",
		200
	] },
	() => CreateSessionRequest$,
	() => CreateSessionOutput$
];
var DeleteObject$ = [
	9,
	n0,
	_DOel,
	{ [_h]: [
		"DELETE",
		"/{Key+}?x-id=DeleteObject",
		204
	] },
	() => DeleteObjectRequest$,
	() => DeleteObjectOutput$
];
var GetObject$ = [
	9,
	n0,
	_GO,
	{
		[_hC]: "-",
		[_h]: [
			"GET",
			"/{Key+}?x-id=GetObject",
			200
		]
	},
	() => GetObjectRequest$,
	() => GetObjectOutput$
];
var HeadObject$ = [
	9,
	n0,
	_HO,
	{ [_h]: [
		"HEAD",
		"/{Key+}",
		200
	] },
	() => HeadObjectRequest$,
	() => HeadObjectOutput$
];
var PutObject$ = [
	9,
	n0,
	_PO,
	{
		[_hC]: "-",
		[_h]: [
			"PUT",
			"/{Key+}?x-id=PutObject",
			200
		]
	},
	() => PutObjectRequest$,
	() => PutObjectOutput$
];
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/commands/CreateSessionCommand.js
var CreateSessionCommand = class extends command(_ep4, _mw0, "CreateSession", CreateSession$) {};
var package_default = {
	name: "@aws-sdk/client-s3",
	version: "3.1141.0",
	description: "AWS SDK for JavaScript S3 Client for Node.js, Browser and React Native",
	homepage: "https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-s3",
	license: "Apache-2.0",
	author: {
		"name": "AWS SDK for JavaScript Team",
		"url": "https://aws.amazon.com/sdk-for-javascript/"
	},
	repository: {
		"type": "git",
		"url": "https://github.com/aws/aws-sdk-js-v3.git",
		"directory": "clients/client-s3"
	},
	files: ["dist-*/**"],
	sideEffects: false,
	main: "./dist-cjs/index.js",
	module: "./dist-es/index.js",
	browser: { "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.browser" },
	types: "./dist-types/index.d.ts",
	typesVersions: { "<4.5": { "dist-types/*": ["dist-types/ts3.4/*"] } },
	"react-native": { "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.native" },
	scripts: {
		"build": "concurrently 'yarn:build:types' 'yarn:build:es' && yarn build:cjs",
		"build:cjs": "node ../../scripts/compilation/inline",
		"build:es": "premove dist-es && tsc -p tsconfig.es.json",
		"build:include:deps": "yarn g:turbo run build -F=\"$npm_package_name\"",
		"build:types": "premove dist-types && tsc -p tsconfig.types.json",
		"build:types:downlevel": "downlevel-dts dist-types dist-types/ts3.4",
		"clean": "premove dist-cjs dist-es dist-types",
		"extract:docs": "api-extractor run --local",
		"generate:client": "node ../../scripts/generate-clients/single-service",
		"test": "yarn g:vitest run --passWithNoTests",
		"test:watch": "yarn g:vitest watch --passWithNoTests",
		"test:integration": "yarn g:vitest run --passWithNoTests -c vitest.config.integ.mts",
		"test:integration:watch": "yarn g:vitest watch --passWithNoTests -c vitest.config.integ.mts",
		"test:e2e": "yarn g:vitest run -c vitest.config.e2e.mts",
		"test:e2e:watch": "yarn g:vitest watch -c vitest.config.e2e.mts",
		"test:browser": "yarn g:vitest run -c vitest.config.browser.mts",
		"test:browser:watch": "yarn g:vitest watch -c vitest.config.browser.mts",
		"test:index": "tsc -p tsconfig.test.json && node ./test/index-objects.spec.mjs"
	},
	dependencies: {
		"@aws-sdk/checksums": "^3.1001.1",
		"@aws-sdk/core": "^3.978.1",
		"@aws-sdk/credential-provider-node": "^3.972.84",
		"@aws-sdk/middleware-sdk-s3": "^3.972.77",
		"@aws-sdk/signature-v4-multi-region": "^3.996.47",
		"@aws-sdk/types": "^3.974.6",
		"@smithy/core": "^3.35.0",
		"@smithy/fetch-http-handler": "^5.8.0",
		"@smithy/node-http-handler": "^4.12.1",
		"@smithy/types": "^4.19.0",
		"tslib": "^2.6.2"
	},
	devDependencies: {
		"@aws-sdk/signature-v4-crt": "3.1141.0",
		"@smithy/snapshot-testing": "^2.3.2",
		"@tsconfig/node20": "20.1.8",
		"@types/node": "^20.14.8",
		"concurrently": "7.0.0",
		"downlevel-dts": "0.10.1",
		"premove": "4.0.0",
		"typescript": "~7.0.2",
		"vitest": "^4.0.17"
	},
	engines: { "node": ">=20.0.0" }
};
//#endregion
//#region node_modules/@aws-sdk/credential-provider-env/dist-es/fromEnv.js
var ENV_KEY = "AWS_ACCESS_KEY_ID";
var ENV_SECRET = "AWS_SECRET_ACCESS_KEY";
var ENV_SESSION = "AWS_SESSION_TOKEN";
var ENV_EXPIRATION = "AWS_CREDENTIAL_EXPIRATION";
var ENV_CREDENTIAL_SCOPE = "AWS_CREDENTIAL_SCOPE";
var ENV_ACCOUNT_ID = "AWS_ACCOUNT_ID";
var fromEnv = (init) => async () => {
	init?.logger?.debug("@aws-sdk/credential-provider-env - fromEnv");
	const accessKeyId = process.env[ENV_KEY];
	const secretAccessKey = process.env[ENV_SECRET];
	const sessionToken = process.env[ENV_SESSION];
	const expiry = process.env[ENV_EXPIRATION];
	const credentialScope = process.env[ENV_CREDENTIAL_SCOPE];
	const accountId = process.env[ENV_ACCOUNT_ID];
	if (accessKeyId && secretAccessKey) {
		const credentials = {
			accessKeyId,
			secretAccessKey,
			...sessionToken && { sessionToken },
			...expiry && { expiration: new Date(expiry) },
			...credentialScope && { credentialScope },
			...accountId && { accountId }
		};
		(0, import_client$1.setCredentialFeature)(credentials, "CREDENTIALS_ENV_VARS", "g");
		return credentials;
	}
	throw new import_config.CredentialsProviderError("Unable to find environment variable credentials.", { logger: init?.logger });
};
//#endregion
//#region node_modules/@aws-sdk/credential-provider-env/dist-es/index.js
var dist_es_exports$2 = /* @__PURE__ */ __exportAll({
	ENV_ACCOUNT_ID: () => ENV_ACCOUNT_ID,
	ENV_CREDENTIAL_SCOPE: () => ENV_CREDENTIAL_SCOPE,
	ENV_EXPIRATION: () => ENV_EXPIRATION,
	ENV_KEY: () => ENV_KEY,
	ENV_SECRET: () => ENV_SECRET,
	ENV_SESSION: () => ENV_SESSION,
	fromEnv: () => fromEnv
});
var remoteProvider = async (init) => {
	const { ENV_CMDS_FULL_URI, ENV_CMDS_RELATIVE_URI, fromContainerMetadata, fromInstanceMetadata } = await import("../@smithy/credential-provider-imds+[...].mjs").then((n) => n.t);
	if (process.env[ENV_CMDS_RELATIVE_URI] || process.env[ENV_CMDS_FULL_URI]) {
		init.logger?.debug("@aws-sdk/credential-provider-node - remoteProvider::fromHttp/fromContainerMetadata");
		const { fromHttp } = await import("./credential-provider-http+[...].mjs").then((n) => n.t);
		return (0, import_config.chain)(fromHttp(init), fromContainerMetadata(init));
	}
	if (process.env["AWS_EC2_METADATA_DISABLED"] && process.env["AWS_EC2_METADATA_DISABLED"] !== "false") return async () => {
		throw new import_config.CredentialsProviderError("EC2 Instance Metadata Service access disabled", { logger: init.logger });
	};
	init.logger?.debug("@aws-sdk/credential-provider-node - remoteProvider::fromInstanceMetadata");
	return fromInstanceMetadata(init);
};
//#endregion
//#region node_modules/@aws-sdk/credential-provider-node/dist-es/runtime/memoize-chain.js
function memoizeChain(providers, treatAsExpired) {
	const chain = internalCreateChain(providers);
	let activeLock;
	let passiveLock;
	let credentials;
	let forceRefreshLock;
	const provider = async (options) => {
		if (options?.forceRefresh) {
			if (!forceRefreshLock) forceRefreshLock = chain(options).then((c) => {
				credentials = c;
			}).finally(() => {
				forceRefreshLock = void 0;
			});
			await forceRefreshLock;
			return credentials;
		}
		if (credentials?.expiration) {
			if (credentials?.expiration?.getTime() < Date.now()) credentials = void 0;
		}
		if (activeLock) await activeLock;
		else if (!credentials || treatAsExpired?.(credentials)) {
			if (credentials) {
				if (!passiveLock) passiveLock = chain(options).then((c) => {
					credentials = c;
				}).catch(() => {}).finally(() => {
					passiveLock = void 0;
				});
			} else {
				activeLock = chain(options).then((c) => {
					credentials = c;
				}).finally(() => {
					activeLock = void 0;
				});
				return provider(options);
			}
		}
		return credentials;
	};
	return provider;
}
var internalCreateChain = (providers) => async (awsIdentityProperties) => {
	let lastProviderError;
	for (const provider of providers) try {
		return await provider(awsIdentityProperties);
	} catch (err) {
		lastProviderError = err;
		if (err?.tryNextLink) continue;
		throw err;
	}
	throw lastProviderError;
};
//#endregion
//#region node_modules/@aws-sdk/credential-provider-node/dist-es/defaultProvider.js
var multipleCredentialSourceWarningEmitted = false;
var defaultProvider = (init = {}) => memoizeChain([
	async () => {
		if (init.profile ?? process.env[import_config.ENV_PROFILE]) {
			if (process.env["AWS_ACCESS_KEY_ID"] && process.env["AWS_SECRET_ACCESS_KEY"]) {
				if (!multipleCredentialSourceWarningEmitted) {
					(init.logger?.warn && init.logger?.constructor?.name !== "NoOpLogger" ? init.logger.warn.bind(init.logger) : console.warn)(`@aws-sdk/credential-provider-node - defaultProvider::fromEnv WARNING:
    Multiple credential sources detected: 
    Both AWS_PROFILE and the pair AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY static credentials are set.
    This SDK will proceed with the AWS_PROFILE value.
    
    However, a future version may change this behavior to prefer the ENV static credentials.
    Please ensure that your environment only sets either the AWS_PROFILE or the
    AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY pair.
`);
					multipleCredentialSourceWarningEmitted = true;
				}
			}
			throw new import_config.CredentialsProviderError("AWS_PROFILE is set, skipping fromEnv provider.", {
				logger: init.logger,
				tryNextLink: true
			});
		}
		init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromEnv");
		return fromEnv(init)();
	},
	async (awsIdentityProperties) => {
		init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromSSO");
		const { ssoStartUrl, ssoAccountId, ssoRegion, ssoRoleName, ssoSession } = init;
		if (!ssoStartUrl && !ssoAccountId && !ssoRegion && !ssoRoleName && !ssoSession) throw new import_config.CredentialsProviderError("Skipping SSO provider in default chain (inputs do not include SSO fields).", { logger: init.logger });
		const { fromSSO } = await import("./credential-provider-sso+[...].mjs").then((n) => n.t);
		return fromSSO(init)(awsIdentityProperties);
	},
	async (awsIdentityProperties) => {
		init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromIni");
		const { fromIni } = await import("./credential-provider-ini+[...].mjs").then((n) => n.t);
		return fromIni(init)(awsIdentityProperties);
	},
	async (awsIdentityProperties) => {
		init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromProcess");
		const { fromProcess } = await import("./credential-provider-process+[...].mjs").then((n) => n.t);
		return fromProcess(init)(awsIdentityProperties);
	},
	async (awsIdentityProperties) => {
		init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::fromTokenFile");
		const { fromTokenFile } = await import("./credential-provider-web-identity+[...].mjs").then((n) => n.t);
		return fromTokenFile(init)(awsIdentityProperties);
	},
	async () => {
		init.logger?.debug("@aws-sdk/credential-provider-node - defaultProvider::remoteProvider");
		return (await remoteProvider(init))();
	},
	async () => {
		throw new import_config.CredentialsProviderError("Could not load credentials from any providers", {
			tryNextLink: false,
			logger: init.logger
		});
	}
], credentialsTreatedAsExpired);
var credentialsTreatedAsExpired = (credentials) => credentials?.expiration !== void 0 && credentials.expiration.getTime() - Date.now() < 3e5;
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/build-abort-error.js
function buildAbortError(abortSignal) {
	const reason = abortSignal && typeof abortSignal === "object" && "reason" in abortSignal ? abortSignal.reason : void 0;
	if (reason) {
		if (reason instanceof Error) {
			const abortError = /* @__PURE__ */ new Error("Request aborted");
			abortError.name = "AbortError";
			abortError.cause = reason;
			return abortError;
		}
		const abortError = new Error(String(reason));
		abortError.name = "AbortError";
		return abortError;
	}
	const abortError = /* @__PURE__ */ new Error("Request aborted");
	abortError.name = "AbortError";
	return abortError;
}
var init_build_abort_error = __esmMin((() => {}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/constants.js
var NODEJS_TIMEOUT_ERROR_CODES;
var init_constants = __esmMin((() => {
	NODEJS_TIMEOUT_ERROR_CODES = [
		"ECONNRESET",
		"EPIPE",
		"ETIMEDOUT"
	];
}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/get-transformed-headers.js
var import_serde$3, getTransformedHeaders;
var init_get_transformed_headers = __esmMin((() => {
	import_serde$3 = require_serde();
	getTransformedHeaders = (headers) => {
		const transformedHeaders = {};
		for (const name in headers) {
			if (!(0, import_serde$3.hasOwn)(headers, name)) continue;
			const headerValues = headers[name];
			transformedHeaders[name] = Array.isArray(headerValues) ? headerValues.join(",") : headerValues;
		}
		return transformedHeaders;
	};
}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/node-https.js
var init_node_https = __esmMin((() => {}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/timing.js
var timing;
var init_timing = __esmMin((() => {
	timing = {
		setTimeout: (cb, ms) => setTimeout(cb, ms),
		clearTimeout: (timeoutId) => clearTimeout(timeoutId)
	};
}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/set-connection-timeout.js
var DEFER_EVENT_LISTENER_TIME$2, setConnectionTimeout;
var init_set_connection_timeout = __esmMin((() => {
	init_timing();
	DEFER_EVENT_LISTENER_TIME$2 = 1e3;
	setConnectionTimeout = (request, reject, timeoutInMs = 0) => {
		if (!timeoutInMs) return -1;
		const registerTimeout = (offset) => {
			const timeoutId = timing.setTimeout(() => {
				request.destroy();
				reject(Object.assign(/* @__PURE__ */ new Error(`@smithy/node-http-handler - the request socket did not establish a connection with the server within the configured timeout of ${timeoutInMs} ms.`), { name: "TimeoutError" }));
			}, timeoutInMs - offset);
			const doWithSocket = (socket) => {
				if (socket?.connecting) socket.on("connect", () => {
					timing.clearTimeout(timeoutId);
				});
				else timing.clearTimeout(timeoutId);
			};
			if (request.socket) doWithSocket(request.socket);
			else request.on("socket", doWithSocket);
		};
		if (timeoutInMs < 2e3) {
			registerTimeout(0);
			return 0;
		}
		return timing.setTimeout(registerTimeout.bind(null, DEFER_EVENT_LISTENER_TIME$2), DEFER_EVENT_LISTENER_TIME$2);
	};
}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/set-request-timeout.js
var setRequestTimeout;
var init_set_request_timeout = __esmMin((() => {
	init_timing();
	setRequestTimeout = (req, reject, timeoutInMs = 0, throwOnRequestTimeout, logger) => {
		if (timeoutInMs) return timing.setTimeout(() => {
			let msg = `@smithy/node-http-handler - [${throwOnRequestTimeout ? "ERROR" : "WARN"}] a request has exceeded the configured ${timeoutInMs} ms requestTimeout.`;
			if (throwOnRequestTimeout) {
				const error = Object.assign(new Error(msg), {
					name: "TimeoutError",
					code: "ETIMEDOUT"
				});
				req.destroy(error);
				reject(error);
			} else {
				msg += ` Init client requestHandler with throwOnRequestTimeout=true to turn this into an error.`;
				logger?.warn?.(msg);
			}
		}, timeoutInMs);
		return -1;
	};
}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/set-socket-keep-alive.js
var DEFER_EVENT_LISTENER_TIME$1, setSocketKeepAlive;
var init_set_socket_keep_alive = __esmMin((() => {
	init_timing();
	DEFER_EVENT_LISTENER_TIME$1 = 3e3;
	setSocketKeepAlive = (request, { keepAlive, keepAliveMsecs }, deferTimeMs = DEFER_EVENT_LISTENER_TIME$1) => {
		if (keepAlive !== true) return -1;
		const registerListener = () => {
			if (request.socket) request.socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
			else request.on("socket", (socket) => {
				socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
			});
		};
		if (deferTimeMs === 0) {
			registerListener();
			return 0;
		}
		return timing.setTimeout(registerListener, deferTimeMs);
	};
}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/set-socket-timeout.js
var DEFER_EVENT_LISTENER_TIME, setSocketTimeout;
var init_set_socket_timeout = __esmMin((() => {
	init_timing();
	DEFER_EVENT_LISTENER_TIME = 3e3;
	setSocketTimeout = (request, reject, timeoutInMs = 0) => {
		const registerTimeout = (offset) => {
			const timeout = timeoutInMs - offset;
			const onTimeout = () => {
				request.destroy();
				reject(Object.assign(/* @__PURE__ */ new Error(`@smithy/node-http-handler - the request socket timed out after ${timeoutInMs} ms of inactivity (configured by client requestHandler).`), { name: "TimeoutError" }));
			};
			if (request.socket) {
				request.socket.setTimeout(timeout, onTimeout);
				request.on("close", () => request.socket?.removeListener("timeout", onTimeout));
			} else request.setTimeout(timeout, onTimeout);
		};
		if (0 < timeoutInMs && timeoutInMs < 6e3) {
			registerTimeout(0);
			return 0;
		}
		return timing.setTimeout(registerTimeout.bind(null, timeoutInMs === 0 ? 0 : DEFER_EVENT_LISTENER_TIME), DEFER_EVENT_LISTENER_TIME);
	};
}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/write-request-body.js
async function writeRequestBody(httpRequest, request, maxContinueTimeoutMs = MIN_WAIT_TIME, externalAgent = false) {
	const headers = request.headers;
	const expect = headers ? headers.Expect || headers.expect : void 0;
	let timeoutId = -1;
	let sendBody = true;
	if (!externalAgent && expect === "100-continue") sendBody = await Promise.race([new Promise((resolve) => {
		timeoutId = Number(timing.setTimeout(() => resolve(true), Math.max(MIN_WAIT_TIME, maxContinueTimeoutMs)));
	}), new Promise((resolve) => {
		httpRequest.on("continue", () => {
			timing.clearTimeout(timeoutId);
			resolve(true);
		});
		httpRequest.on("response", () => {
			timing.clearTimeout(timeoutId);
			resolve(false);
		});
		httpRequest.on("error", () => {
			timing.clearTimeout(timeoutId);
			resolve(false);
		});
	})]);
	if (sendBody) writeBody(httpRequest, request.body);
}
function writeBody(httpRequest, body) {
	if (body instanceof Readable) {
		body.pipe(httpRequest);
		return;
	}
	if (body) {
		const isBuffer = Buffer.isBuffer(body);
		if (isBuffer || typeof body === "string") {
			if (isBuffer && body.byteLength === 0) httpRequest.end();
			else httpRequest.end(body);
			return;
		}
		const uint8 = body;
		if (typeof uint8 === "object" && uint8.buffer && typeof uint8.byteOffset === "number" && typeof uint8.byteLength === "number") {
			httpRequest.end(Buffer.from(uint8.buffer, uint8.byteOffset, uint8.byteLength));
			return;
		}
		httpRequest.end(Buffer.from(body));
		return;
	}
	httpRequest.end();
}
var MIN_WAIT_TIME;
var init_write_request_body = __esmMin((() => {
	init_timing();
	MIN_WAIT_TIME = 6e3;
}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/node-http-handler.js
var import_serde$2, import_protocols$2, hAgent, hRequest, NodeHttpHandler;
var init_node_http_handler = __esmMin((() => {
	import_serde$2 = require_serde();
	import_protocols$2 = require_protocols$1();
	init_build_abort_error();
	init_constants();
	init_get_transformed_headers();
	init_node_https();
	init_set_connection_timeout();
	init_set_request_timeout();
	init_set_socket_keep_alive();
	init_set_socket_timeout();
	init_timing();
	init_write_request_body();
	hAgent = void 0;
	hRequest = void 0;
	NodeHttpHandler = class NodeHttpHandler {
		config;
		configProvider;
		socketWarningTimestamp = 0;
		externalAgent = false;
		metadata = { handlerProtocol: "http/1.1" };
		static create(instanceOrOptions) {
			if (typeof instanceOrOptions?.handle === "function") return instanceOrOptions;
			return new NodeHttpHandler(instanceOrOptions);
		}
		static checkSocketUsage(agent, socketWarningTimestamp, logger = console) {
			const { sockets, requests, maxSockets } = agent;
			if (typeof maxSockets !== "number" || maxSockets === Infinity) return socketWarningTimestamp;
			if (Date.now() - 15e3 < socketWarningTimestamp) return socketWarningTimestamp;
			if (sockets && requests) for (const origin in sockets) {
				if (!(0, import_serde$2.hasOwn)(sockets, origin)) continue;
				const socketsInUse = sockets[origin]?.length ?? 0;
				const requestsEnqueued = requests[origin]?.length ?? 0;
				if (socketsInUse >= maxSockets && requestsEnqueued >= 2 * maxSockets) {
					logger?.warn?.(`@smithy/node-http-handler:WARN - socket usage at capacity=${socketsInUse} and ${requestsEnqueued} additional requests are enqueued.
See https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html
or increase socketAcquisitionWarningTimeout=(millis) in the NodeHttpHandler config.`);
					return Date.now();
				}
			}
			return socketWarningTimestamp;
		}
		constructor(options) {
			this.configProvider = new Promise((resolve, reject) => {
				if (typeof options === "function") options().then((_options) => {
					resolve(this.resolveDefaultConfig(_options));
				}).catch(reject);
				else resolve(this.resolveDefaultConfig(options));
			});
		}
		destroy() {
			this.config?.httpAgent?.destroy();
			this.config?.httpsAgent?.destroy();
		}
		async handle(request, { abortSignal, requestTimeout } = {}) {
			if (!this.config) this.config = await this.configProvider;
			const config = this.config;
			const logger = config.logger;
			const isSSL = request.protocol === "https:";
			if (!isSSL && !this.config.httpAgent) this.config.httpAgent = await this.config.httpAgentProvider();
			return new Promise((_resolve, _reject) => {
				let writeRequestBodyPromise = void 0;
				let socketWarningTimeoutId = -1;
				let connectionTimeoutId = -1;
				let requestTimeoutId = -1;
				let socketTimeoutId = -1;
				let keepAliveTimeoutId = -1;
				const clearTimeouts = () => {
					timing.clearTimeout(socketWarningTimeoutId);
					timing.clearTimeout(connectionTimeoutId);
					timing.clearTimeout(requestTimeoutId);
					timing.clearTimeout(socketTimeoutId);
					timing.clearTimeout(keepAliveTimeoutId);
				};
				const resolve = async (arg) => {
					await writeRequestBodyPromise;
					clearTimeouts();
					_resolve(arg);
				};
				const reject = async (arg) => {
					await writeRequestBodyPromise;
					clearTimeouts();
					_reject(arg);
				};
				if (abortSignal?.aborted) {
					reject(buildAbortError(abortSignal));
					return;
				}
				const headers = request.headers;
				const expectContinue = headers ? (headers.Expect ?? headers.expect) === "100-continue" : false;
				let agent = isSSL ? config.httpsAgent : config.httpAgent;
				if (expectContinue && !this.externalAgent) agent = new (isSSL ? node_https.Agent : hAgent)({
					keepAlive: false,
					maxSockets: Infinity
				});
				socketWarningTimeoutId = timing.setTimeout(() => {
					this.socketWarningTimestamp = NodeHttpHandler.checkSocketUsage(agent, this.socketWarningTimestamp, logger);
				}, config.socketAcquisitionWarningTimeout ?? (config.requestTimeout ?? 2e3) + (config.connectionTimeout ?? 1e3));
				const queryString = request.query ? (0, import_protocols$2.buildQueryString)(request.query) : "";
				let auth = void 0;
				if (request.username != null || request.password != null) auth = `${request.username ?? ""}:${request.password ?? ""}`;
				let path = request.path;
				if (queryString) path += `?${queryString}`;
				if (request.fragment) path += `#${request.fragment}`;
				let hostname = request.hostname ?? "";
				if (hostname[0] === "[" && hostname.endsWith("]")) hostname = request.hostname.slice(1, -1);
				else hostname = request.hostname;
				const nodeHttpsOptions = {
					headers: request.headers,
					host: hostname,
					method: request.method,
					path,
					port: request.port,
					agent,
					auth
				};
				const req = (isSSL ? node_https.request : hRequest)(nodeHttpsOptions, (res) => {
					const httpResponse = new import_protocols$2.HttpResponse({
						statusCode: res.statusCode || -1,
						reason: res.statusMessage,
						headers: getTransformedHeaders(res.headers),
						body: res
					});
					resolve({ response: httpResponse });
				});
				req.on("error", (err) => {
					if (NODEJS_TIMEOUT_ERROR_CODES.includes(err.code)) reject(Object.assign(err, { name: "TimeoutError" }));
					else reject(err);
				});
				if (abortSignal) {
					const onAbort = () => {
						req.destroy();
						const abortError = buildAbortError(abortSignal);
						reject(abortError);
					};
					if (typeof abortSignal.addEventListener === "function") {
						const signal = abortSignal;
						signal.addEventListener("abort", onAbort, { once: true });
						req.once("close", () => signal.removeEventListener("abort", onAbort));
					} else abortSignal.onabort = onAbort;
				}
				const effectiveRequestTimeout = requestTimeout ?? config.requestTimeout;
				connectionTimeoutId = setConnectionTimeout(req, reject, config.connectionTimeout);
				requestTimeoutId = setRequestTimeout(req, reject, effectiveRequestTimeout, config.throwOnRequestTimeout, logger ?? console);
				socketTimeoutId = setSocketTimeout(req, reject, config.socketTimeout);
				const httpAgent = nodeHttpsOptions.agent;
				if (typeof httpAgent === "object" && "keepAlive" in httpAgent) keepAliveTimeoutId = setSocketKeepAlive(req, {
					keepAlive: httpAgent.keepAlive,
					keepAliveMsecs: httpAgent.keepAliveMsecs
				});
				writeRequestBodyPromise = writeRequestBody(req, request, effectiveRequestTimeout, this.externalAgent).catch((e) => {
					clearTimeouts();
					return _reject(e);
				});
			});
		}
		updateHttpClientConfig(key, value) {
			this.config = void 0;
			this.configProvider = this.configProvider.then((config) => {
				if (key === Symbol.for("logger")) return {
					...config,
					logger: config.logger ?? value
				};
				return {
					...config,
					[key]: value
				};
			});
		}
		httpHandlerConfigs() {
			return this.config ?? {};
		}
		resolveDefaultConfig(options) {
			const { requestTimeout, connectionTimeout, socketTimeout, socketAcquisitionWarningTimeout, httpAgent, httpsAgent, throwOnRequestTimeout, logger } = options || {};
			const keepAlive = true;
			const maxSockets = 50;
			return {
				connectionTimeout,
				requestTimeout,
				socketTimeout,
				socketAcquisitionWarningTimeout,
				throwOnRequestTimeout,
				httpAgentProvider: async () => {
					const node_http = await import("node:http");
					const { Agent, request } = node_http.default ?? node_http;
					hRequest = request;
					hAgent = Agent;
					if (httpAgent instanceof hAgent || typeof httpAgent?.destroy === "function") {
						this.externalAgent = true;
						return httpAgent;
					}
					return new hAgent({
						keepAlive,
						maxSockets,
						...httpAgent
					});
				},
				httpsAgent: (() => {
					if (httpsAgent instanceof node_https.Agent || typeof httpsAgent?.destroy === "function") {
						this.externalAgent = true;
						return httpsAgent;
					}
					return new node_https.Agent({
						keepAlive,
						maxSockets,
						...httpsAgent
					});
				})(),
				logger
			};
		}
	};
}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/node-http2.js
var init_node_http2 = __esmMin((() => {}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/http2/ClientHttp2SessionRef.js
var ids, ClientHttp2SessionRef;
var init_ClientHttp2SessionRef = __esmMin((() => {
	ids = /* @__PURE__ */ new Uint16Array(1);
	ClientHttp2SessionRef = class {
		id = ids[0]++;
		total = 0;
		max = 0;
		session;
		refs = 0;
		constructor(session) {
			session.unref();
			this.session = session;
		}
		retain() {
			if (this.session.destroyed) throw new Error("@smithy/node-http-handler - cannot acquire reference to destroyed session.");
			this.refs += 1;
			this.total += 1;
			this.max = Math.max(this.refs, this.max);
			this.session.ref();
		}
		free() {
			if (this.session.destroyed) return;
			this.refs -= 1;
			if (this.refs === 0) this.session.unref();
			if (this.refs < 0) throw new Error("@smithy/node-http-handler - ClientHttp2Session refcount at zero, cannot decrement.");
		}
		deref() {
			return this.session;
		}
		close() {
			if (!this.session.closed) this.session.close();
		}
		destroy() {
			this.refs = 0;
			if (!this.session.destroyed) {
				this.session.setTimeout(0);
				this.session.destroy();
			}
		}
		useCount() {
			return this.refs;
		}
	};
}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/node-http2-connection-pool.js
var NodeHttp2ConnectionPool;
var init_node_http2_connection_pool = __esmMin((() => {
	init_ClientHttp2SessionRef();
	NodeHttp2ConnectionPool = class {
		sessions = [];
		maxConcurrency = 0;
		constructor(sessions) {
			this.sessions = (sessions ?? []).map((session) => new ClientHttp2SessionRef(session));
		}
		poll() {
			let cleanup = false;
			for (const session of this.sessions) {
				if (session.deref().destroyed) {
					cleanup = true;
					continue;
				}
				if (!this.maxConcurrency || session.useCount() < this.maxConcurrency) return session;
			}
			if (cleanup) {
				for (const session of this.sessions) if (session.deref().destroyed) this.remove(session);
			}
		}
		offerLast(ref) {
			this.sessions.push(ref);
		}
		remove(ref) {
			const ix = this.sessions.indexOf(ref);
			if (ix > -1) this.sessions.splice(ix, 1);
		}
		[Symbol.iterator]() {
			return this.sessions[Symbol.iterator]();
		}
		setMaxConcurrency(maxConcurrency) {
			this.maxConcurrency = maxConcurrency;
		}
		destroy(ref) {
			this.remove(ref);
			ref.destroy();
		}
	};
}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/node-http2-connection-manager.js
var NodeHttp2ConnectionManager;
var init_node_http2_connection_manager = __esmMin((() => {
	init_ClientHttp2SessionRef();
	init_node_http2_connection_pool();
	NodeHttp2ConnectionManager = class {
		config;
		connectOptions;
		connectionPools = /* @__PURE__ */ new Map();
		constructor(config) {
			this.config = config;
			if (this.config.maxConcurrency && this.config.maxConcurrency <= 0) throw new RangeError("maxConcurrency must be greater than zero.");
		}
		lease(requestContext, connectionConfiguration) {
			const url = this.getUrlString(requestContext);
			const pool = this.getPool(url);
			if (!this.config.disableConcurrency && !connectionConfiguration.isEventStream) {
				const available = pool.poll();
				if (available) {
					available.retain();
					return available;
				}
			}
			const ref = new ClientHttp2SessionRef(this.connect(url));
			const session = ref.deref();
			if (this.config.maxConcurrency) session.settings({ maxConcurrentStreams: this.config.maxConcurrency }, (err) => {
				if (err) throw new Error("Fail to set maxConcurrentStreams to " + this.config.maxConcurrency + "when creating new session for " + requestContext.destination.toString());
			});
			const graceful = () => {
				this.removeFromPoolAndClose(url, ref);
			};
			const ensureDestroyed = () => {
				this.removeFromPoolAndCheckedDestroy(url, ref);
			};
			session.on("goaway", graceful);
			session.on("error", ensureDestroyed);
			session.on("frameError", ensureDestroyed);
			session.on("close", ensureDestroyed);
			if (connectionConfiguration.requestTimeout) session.setTimeout(connectionConfiguration.requestTimeout, ensureDestroyed);
			pool.offerLast(ref);
			ref.retain();
			return ref;
		}
		release(_requestContext, ref) {
			ref.free();
		}
		createIsolatedSession(requestContext, connectionConfiguration) {
			const url = this.getUrlString(requestContext);
			const ref = new ClientHttp2SessionRef(this.connect(url));
			const session = ref.deref();
			session.settings({ maxConcurrentStreams: 1 });
			const ensureDestroyed = () => {
				ref.destroy();
			};
			session.on("error", ensureDestroyed);
			session.on("frameError", ensureDestroyed);
			session.on("close", ensureDestroyed);
			const timeout = connectionConfiguration.requestTimeout ?? 3e5;
			session.setTimeout(timeout, ensureDestroyed);
			ref.retain();
			return ref;
		}
		destroy() {
			for (const [url, connectionPool] of this.connectionPools) {
				for (const session of [...connectionPool]) session.destroy();
				this.connectionPools.delete(url);
			}
		}
		setMaxConcurrentStreams(maxConcurrentStreams) {
			if (maxConcurrentStreams && maxConcurrentStreams <= 0) throw new RangeError("maxConcurrentStreams must be greater than zero.");
			this.config.maxConcurrency = maxConcurrentStreams;
			for (const pool of this.connectionPools.values()) pool.setMaxConcurrency(maxConcurrentStreams);
		}
		setDisableConcurrentStreams(disableConcurrentStreams) {
			this.config.disableConcurrency = disableConcurrentStreams;
		}
		setNodeHttp2ConnectOptions(nodeHttp2ConnectOptions) {
			this.connectOptions = nodeHttp2ConnectOptions;
		}
		debug() {
			const pools = {};
			for (const [url, pool] of this.connectionPools) {
				const sessions = [];
				for (const ref of pool) sessions.push({
					id: ref.id,
					active: ref.useCount(),
					maxConcurrent: ref.max,
					totalRequests: ref.total
				});
				pools[url] = { sessions };
			}
			return pools;
		}
		removeFromPoolAndClose(authority, ref) {
			this.connectionPools.get(authority)?.remove(ref);
			ref.close();
		}
		removeFromPoolAndCheckedDestroy(authority, ref) {
			this.connectionPools.get(authority)?.remove(ref);
			ref.destroy();
		}
		getPool(url) {
			if (!this.connectionPools.has(url)) {
				const pool = new NodeHttp2ConnectionPool();
				if (this.config.maxConcurrency) pool.setMaxConcurrency(this.config.maxConcurrency);
				this.connectionPools.set(url, pool);
			}
			return this.connectionPools.get(url);
		}
		getUrlString(request) {
			return request.destination.toString();
		}
		connect(url) {
			return this.connectOptions === void 0 ? nodeHTTP2.connect(url) : nodeHTTP2.connect(url, this.connectOptions);
		}
	};
}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/node-http2-handler.js
var import_protocols$1, constants, NodeHttp2Handler;
var init_node_http2_handler = __esmMin((() => {
	import_protocols$1 = require_protocols$1();
	init_build_abort_error();
	init_get_transformed_headers();
	init_node_http2();
	init_node_http2_connection_manager();
	init_write_request_body();
	({constants} = node_http2);
	NodeHttp2Handler = class NodeHttp2Handler {
		config;
		configProvider;
		metadata = { handlerProtocol: "h2" };
		connectionManager = new NodeHttp2ConnectionManager({});
		static create(instanceOrOptions) {
			if (typeof instanceOrOptions?.handle === "function") return instanceOrOptions;
			return new NodeHttp2Handler(instanceOrOptions);
		}
		constructor(options) {
			this.configProvider = new Promise((resolve, reject) => {
				if (typeof options === "function") options().then((opts) => {
					resolve(opts || {});
				}).catch(reject);
				else resolve(options || {});
			});
		}
		destroy() {
			this.connectionManager.destroy();
		}
		async handle(request, { abortSignal, requestTimeout, isEventStream } = {}) {
			if (!this.config) {
				this.config = await this.configProvider;
				const { disableConcurrentStreams, maxConcurrentStreams, nodeHttp2ConnectOptions } = this.config;
				this.connectionManager.setDisableConcurrentStreams(disableConcurrentStreams ?? false);
				if (maxConcurrentStreams) this.connectionManager.setMaxConcurrentStreams(maxConcurrentStreams);
				if (nodeHttp2ConnectOptions) this.connectionManager.setNodeHttp2ConnectOptions(nodeHttp2ConnectOptions);
			}
			const { requestTimeout: configRequestTimeout, disableConcurrentStreams } = this.config;
			const useIsolatedSession = disableConcurrentStreams || isEventStream;
			const effectiveRequestTimeout = requestTimeout ?? configRequestTimeout;
			return new Promise((_resolve, _reject) => {
				let fulfilled = false;
				let writeRequestBodyPromise = void 0;
				const resolve = async (arg) => {
					await writeRequestBodyPromise;
					_resolve(arg);
				};
				const reject = async (arg) => {
					await writeRequestBodyPromise;
					_reject(arg);
				};
				if (abortSignal?.aborted) {
					fulfilled = true;
					reject(buildAbortError(abortSignal));
					return;
				}
				const { hostname, method, port, protocol, query } = request;
				let auth = "";
				if (request.username != null || request.password != null) auth = `${request.username ?? ""}:${request.password ?? ""}@`;
				const authority = `${protocol}//${auth}${hostname}${port ? `:${port}` : ""}`;
				const requestContext = { destination: new URL(authority) };
				const connectConfig = {
					requestTimeout: this.config?.sessionTimeout,
					isEventStream
				};
				const ref = useIsolatedSession ? this.connectionManager.createIsolatedSession(requestContext, connectConfig) : this.connectionManager.lease(requestContext, connectConfig);
				const session = ref.deref();
				const rejectWithDestroy = (err) => {
					if (useIsolatedSession) ref.destroy();
					fulfilled = true;
					reject(err);
				};
				const queryString = query ? (0, import_protocols$1.buildQueryString)(query) : "";
				let path = request.path;
				if (queryString) path += `?${queryString}`;
				if (request.fragment) path += `#${request.fragment}`;
				const clientHttp2Stream = session.request({
					...request.headers,
					[constants.HTTP2_HEADER_PATH]: path,
					[constants.HTTP2_HEADER_METHOD]: method
				});
				if (effectiveRequestTimeout) clientHttp2Stream.setTimeout(effectiveRequestTimeout, () => {
					clientHttp2Stream.close();
					const timeoutError = /* @__PURE__ */ new Error(`Stream timed out because of no activity for ${effectiveRequestTimeout} ms`);
					timeoutError.name = "TimeoutError";
					rejectWithDestroy(timeoutError);
				});
				if (abortSignal) {
					const onAbort = () => {
						clientHttp2Stream.close();
						const abortError = buildAbortError(abortSignal);
						rejectWithDestroy(abortError);
					};
					if (typeof abortSignal.addEventListener === "function") {
						const signal = abortSignal;
						signal.addEventListener("abort", onAbort, { once: true });
						clientHttp2Stream.once("close", () => signal.removeEventListener("abort", onAbort));
					} else abortSignal.onabort = onAbort;
				}
				clientHttp2Stream.on("frameError", (type, code, id) => {
					rejectWithDestroy(/* @__PURE__ */ new Error(`Frame type id ${type} in stream id ${id} has failed with code ${code}.`));
				});
				clientHttp2Stream.on("error", rejectWithDestroy);
				clientHttp2Stream.on("aborted", () => {
					rejectWithDestroy(/* @__PURE__ */ new Error(`HTTP/2 stream is abnormally aborted in mid-communication with result code ${clientHttp2Stream.rstCode}.`));
				});
				clientHttp2Stream.on("response", (headers) => {
					const httpResponse = new import_protocols$1.HttpResponse({
						statusCode: headers[":status"] ?? -1,
						headers: getTransformedHeaders(headers),
						body: clientHttp2Stream
					});
					fulfilled = true;
					resolve({ response: httpResponse });
					if (useIsolatedSession) {
						session.close();
						clientHttp2Stream.on("end", () => {
							ref.destroy();
						});
					}
				});
				clientHttp2Stream.on("close", () => {
					if (useIsolatedSession) ref.destroy();
					else this.connectionManager.release(requestContext, ref);
					if (!fulfilled) {
						const error = /* @__PURE__ */ new Error("Unexpected error: http2 request did not get a response");
						if (session.destroyed) error.name = "TimeoutError";
						rejectWithDestroy(error);
					}
				});
				writeRequestBodyPromise = writeRequestBody(clientHttp2Stream, request, effectiveRequestTimeout);
			});
		}
		updateHttpClientConfig(key, value) {
			this.config = void 0;
			this.configProvider = this.configProvider.then((config) => {
				return {
					...config,
					[key]: value
				};
			});
		}
		httpHandlerConfigs() {
			return this.config ?? {};
		}
	};
}));
//#endregion
//#region node_modules/@smithy/node-http-handler/dist-es/index.js
var dist_es_exports$1 = /* @__PURE__ */ __exportAll({
	DEFAULT_REQUEST_TIMEOUT: () => 0,
	NodeHttp2Handler: () => NodeHttp2Handler,
	NodeHttpHandler: () => NodeHttpHandler,
	streamCollector: () => import_serde$1.streamCollector
});
var import_serde$1;
var init_dist_es = __esmMin((() => {
	init_node_http_handler();
	init_node_http2_handler();
	import_serde$1 = require_serde();
}));
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/runtimeConfig.shared.js
init_dist_es();
var import_sha = require_sha();
init_dist_es$2();
var import_checksum = require_checksum();
var import_protocols = require_protocols$1();
var import_serde = require_serde();
var getRuntimeConfig$1 = (config) => {
	return {
		apiVersion: "2006-03-01",
		base64Decoder: config?.base64Decoder ?? import_serde.fromBase64,
		base64Encoder: config?.base64Encoder ?? import_serde.toBase64,
		disableHostPrefix: config?.disableHostPrefix ?? false,
		endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
		extensions: config?.extensions ?? [],
		getAwsChunkedEncodingStream: config?.getAwsChunkedEncodingStream ?? import_serde.getAwsChunkedEncodingStream,
		httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultS3HttpAuthSchemeProvider,
		httpAuthSchemes: config?.httpAuthSchemes ?? [{
			schemeId: "aws.auth#sigv4",
			identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
			signer: new import_httpAuthSchemes.AwsSdkSigV4Signer()
		}, {
			schemeId: "aws.auth#sigv4a",
			identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
			signer: new import_httpAuthSchemes.AwsSdkSigV4ASigner()
		}],
		logger: config?.logger ?? new import_client.NoOpLogger(),
		md5: config?.md5 ?? import_checksum.Md5,
		protocol: config?.protocol ?? import_s3.S3RestXmlProtocol,
		protocolSettings: config?.protocolSettings ?? {
			defaultNamespace: "com.amazonaws.s3",
			errorTypeRegistries,
			xmlNamespace: "http://s3.amazonaws.com/doc/2006-03-01/",
			version: "2006-03-01",
			serviceTarget: "AmazonS3"
		},
		sdkStreamMixin: config?.sdkStreamMixin ?? import_serde.sdkStreamMixin,
		serviceId: config?.serviceId ?? "S3",
		sha1: config?.sha1 ?? import_sha.Sha1,
		sha256: config?.sha256 ?? import_checksum.Sha256,
		signerConstructor: config?.signerConstructor ?? SignatureV4MultiRegion,
		signingEscapePath: config?.signingEscapePath ?? false,
		urlParser: config?.urlParser ?? import_protocols.parseUrl,
		useArnRegion: config?.useArnRegion ?? void 0,
		utf8Decoder: config?.utf8Decoder ?? import_serde.fromUtf8,
		utf8Encoder: config?.utf8Encoder ?? import_serde.toUtf8
	};
};
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/runtimeConfig.js
var getRuntimeConfig = (config) => {
	(0, import_client.emitWarningIfUnsupportedVersion)(process.version);
	const defaultsMode = (0, import_config.resolveDefaultsModeConfig)(config);
	const defaultConfigProvider = () => defaultsMode().then(import_client.loadConfigsForDefaultMode);
	const clientSharedValues = getRuntimeConfig$1(config);
	(0, import_client$1.emitWarningIfUnsupportedVersion)(process.version);
	const loaderConfig = {
		profile: config?.profile,
		logger: clientSharedValues.logger
	};
	return {
		...clientSharedValues,
		...config,
		runtime: "node",
		defaultsMode,
		authSchemePreference: config?.authSchemePreference ?? (0, import_config.loadConfig)(import_httpAuthSchemes.NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
		bodyLengthChecker: config?.bodyLengthChecker ?? import_serde.calculateBodyLength,
		credentialDefaultProvider: config?.credentialDefaultProvider ?? defaultProvider,
		defaultUserAgentProvider: config?.defaultUserAgentProvider ?? (0, import_client$1.createDefaultUserAgentProvider)({
			serviceId: clientSharedValues.serviceId,
			clientVersion: package_default.version
		}),
		disableS3ExpressSessionAuth: config?.disableS3ExpressSessionAuth ?? (0, import_config.loadConfig)(import_s3.NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_OPTIONS, loaderConfig),
		eventStreamSerdeProvider: config?.eventStreamSerdeProvider ?? import_event_streams.eventStreamSerdeProvider,
		maxAttempts: config?.maxAttempts ?? (0, import_config.loadConfig)(import_retry.NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
		region: config?.region ?? (0, import_config.loadConfig)(import_config.NODE_REGION_CONFIG_OPTIONS, {
			...import_config.NODE_REGION_CONFIG_FILE_OPTIONS,
			...loaderConfig
		}),
		requestChecksumCalculation: config?.requestChecksumCalculation ?? (0, import_config.loadConfig)(import_flexible_checksums.NODE_REQUEST_CHECKSUM_CALCULATION_CONFIG_OPTIONS, loaderConfig),
		requestHandler: NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
		responseChecksumValidation: config?.responseChecksumValidation ?? (0, import_config.loadConfig)(import_flexible_checksums.NODE_RESPONSE_CHECKSUM_VALIDATION_CONFIG_OPTIONS, loaderConfig),
		retryMode: config?.retryMode ?? (0, import_config.loadConfig)({
			...import_retry.NODE_RETRY_MODE_CONFIG_OPTIONS,
			default: async () => (await defaultConfigProvider()).retryMode || import_retry.DEFAULT_RETRY_MODE
		}, config),
		sigv4aSigningRegionSet: config?.sigv4aSigningRegionSet ?? (0, import_config.loadConfig)(import_httpAuthSchemes.NODE_SIGV4A_CONFIG_OPTIONS, loaderConfig),
		streamCollector: config?.streamCollector ?? import_serde$1.streamCollector,
		streamHasher: config?.streamHasher ?? import_checksum.readableStreamHasher,
		useArnRegion: config?.useArnRegion ?? (0, import_config.loadConfig)(import_s3.NODE_USE_ARN_REGION_CONFIG_OPTIONS, loaderConfig),
		useDualstackEndpoint: config?.useDualstackEndpoint ?? (0, import_config.loadConfig)(import_config.NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
		useFipsEndpoint: config?.useFipsEndpoint ?? (0, import_config.loadConfig)(import_config.NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
		userAgentAppId: config?.userAgentAppId ?? (0, import_config.loadConfig)(import_client$1.NODE_APP_ID_CONFIG_OPTIONS, loaderConfig)
	};
};
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/auth/httpAuthExtensionConfiguration.js
var getHttpAuthExtensionConfiguration = (runtimeConfig) => {
	const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
	let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
	let _credentials = runtimeConfig.credentials;
	return {
		setHttpAuthScheme(httpAuthScheme) {
			const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
			if (index === -1) _httpAuthSchemes.push(httpAuthScheme);
			else _httpAuthSchemes.splice(index, 1, httpAuthScheme);
		},
		httpAuthSchemes() {
			return _httpAuthSchemes;
		},
		setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
			_httpAuthSchemeProvider = httpAuthSchemeProvider;
		},
		httpAuthSchemeProvider() {
			return _httpAuthSchemeProvider;
		},
		setCredentials(credentials) {
			_credentials = credentials;
		},
		credentials() {
			return _credentials;
		}
	};
};
var resolveHttpAuthRuntimeConfig = (config) => {
	return {
		httpAuthSchemes: config.httpAuthSchemes(),
		httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
		credentials: config.credentials()
	};
};
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/runtimeExtensions.js
var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
	const extensionConfiguration = Object.assign((0, import_client$1.getAwsRegionExtensionConfiguration)(runtimeConfig), (0, import_client.getDefaultExtensionConfiguration)(runtimeConfig), (0, import_protocols.getHttpHandlerExtensionConfiguration)(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
	extensions.forEach((extension) => extension.configure(extensionConfiguration));
	return Object.assign(runtimeConfig, (0, import_client$1.resolveAwsRegionExtensionConfiguration)(extensionConfiguration), (0, import_client.resolveDefaultRuntimeConfig)(extensionConfiguration), (0, import_protocols.resolveHttpHandlerRuntimeConfig)(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/S3Client.js
var S3Client = class extends import_client.Client {
	config;
	constructor(...[configuration]) {
		const _config_0 = getRuntimeConfig(configuration || {});
		super(_config_0);
		this.initConfig = _config_0;
		const _config_1 = resolveClientEndpointParameters(_config_0);
		const _config_2 = (0, import_client$1.resolveUserAgentConfig)(_config_1);
		const _config_3 = (0, import_flexible_checksums.resolveFlexibleChecksumsConfig)(_config_2);
		const _config_4 = (0, import_retry.resolveRetryConfig)(_config_3);
		const _config_5 = (0, import_config.resolveRegionConfig)(_config_4);
		const _config_6 = (0, import_client$1.resolveHostHeaderConfig)(_config_5);
		const _config_7 = (0, import_endpoints.resolveEndpointConfig)(_config_6);
		const _config_9 = resolveHttpAuthSchemeConfig((0, import_event_streams.resolveEventStreamSerdeConfig)(_config_7));
		const _config_11 = resolveRuntimeExtensions((0, import_s3.resolveS3Config)(_config_9, { session: [() => this, CreateSessionCommand] }), configuration?.extensions || []);
		this.config = _config_11;
		this.middlewareStack.use((0, import_schema.getSchemaSerdePlugin)(this.config));
		this.middlewareStack.use((0, import_client$1.getUserAgentPlugin)(this.config));
		this.middlewareStack.use((0, import_retry.getRetryPlugin)(this.config));
		this.middlewareStack.use((0, import_protocols.getContentLengthPlugin)(this.config));
		this.middlewareStack.use((0, import_client$1.getHostHeaderPlugin)(this.config));
		this.middlewareStack.use((0, import_client$1.getLoggerPlugin)(this.config));
		this.middlewareStack.use((0, import_client$1.getRecursionDetectionPlugin)(this.config));
		this.middlewareStack.use((0, import_dist_cjs.getHttpAuthSchemeEndpointRuleSetPlugin)(this.config, {
			httpAuthSchemeParametersProvider: defaultS3HttpAuthSchemeParametersProvider,
			identityProviderConfigProvider: async (config) => new import_dist_cjs.DefaultIdentityProviderConfig({
				"aws.auth#sigv4": config.credentials,
				"aws.auth#sigv4a": config.credentials
			})
		}));
		this.middlewareStack.use((0, import_dist_cjs.getHttpSigningPlugin)(this.config));
		this.middlewareStack.use((0, import_s3.getValidateBucketNamePlugin)(this.config));
		this.middlewareStack.use((0, import_s3.getAddExpectContinuePlugin)(this.config));
		this.middlewareStack.use((0, import_s3.getRegionRedirectMiddlewarePlugin)(this.config));
		this.middlewareStack.use((0, import_s3.getS3ExpressPlugin)(this.config));
		this.middlewareStack.use((0, import_s3.getS3ExpressHttpSigningPlugin)(this.config));
	}
	destroy() {
		super.destroy();
	}
};
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteObjectCommand.js
var DeleteObjectCommand = class extends command(_ep0, _mw0, "DeleteObject", DeleteObject$) {};
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectCommand.js
var GetObjectCommand = class extends command(_ep0, _mw7, "GetObject", GetObject$) {};
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/commands/HeadObjectCommand.js
var HeadObjectCommand = class extends command(_ep0, _mw8, "HeadObject", HeadObject$) {};
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectCommand.js
var PutObjectCommand = class extends command(_ep0, _mw11, "PutObject", PutObject$) {};
//#endregion
//#region node_modules/@aws-sdk/client-s3/dist-es/index.js
var dist_es_exports = /* @__PURE__ */ __exportAll({
	AccessDenied: () => AccessDenied,
	AccessDenied$: () => AccessDenied$,
	AnnotationLimitExceeded: () => AnnotationLimitExceeded,
	AnnotationLimitExceeded$: () => AnnotationLimitExceeded$,
	AnnotationNameTooLong: () => AnnotationNameTooLong,
	AnnotationNameTooLong$: () => AnnotationNameTooLong$,
	BucketAlreadyExists: () => BucketAlreadyExists,
	BucketAlreadyExists$: () => BucketAlreadyExists$,
	BucketAlreadyOwnedByYou: () => BucketAlreadyOwnedByYou,
	BucketAlreadyOwnedByYou$: () => BucketAlreadyOwnedByYou$,
	CreateSession$: () => CreateSession$,
	CreateSessionCommand: () => CreateSessionCommand,
	CreateSessionOutput$: () => CreateSessionOutput$,
	CreateSessionRequest$: () => CreateSessionRequest$,
	DeleteObject$: () => DeleteObject$,
	DeleteObjectCommand: () => DeleteObjectCommand,
	DeleteObjectOutput$: () => DeleteObjectOutput$,
	DeleteObjectRequest$: () => DeleteObjectRequest$,
	EncryptionTypeMismatch: () => EncryptionTypeMismatch,
	EncryptionTypeMismatch$: () => EncryptionTypeMismatch$,
	GetObject$: () => GetObject$,
	GetObjectCommand: () => GetObjectCommand,
	GetObjectOutput$: () => GetObjectOutput$,
	GetObjectRequest$: () => GetObjectRequest$,
	HeadObject$: () => HeadObject$,
	HeadObjectCommand: () => HeadObjectCommand,
	HeadObjectOutput$: () => HeadObjectOutput$,
	HeadObjectRequest$: () => HeadObjectRequest$,
	IdempotencyParameterMismatch: () => IdempotencyParameterMismatch,
	IdempotencyParameterMismatch$: () => IdempotencyParameterMismatch$,
	InvalidAnnotationName: () => InvalidAnnotationName,
	InvalidAnnotationName$: () => InvalidAnnotationName$,
	InvalidObjectState: () => InvalidObjectState,
	InvalidObjectState$: () => InvalidObjectState$,
	InvalidPrefix: () => InvalidPrefix,
	InvalidPrefix$: () => InvalidPrefix$,
	InvalidRequest: () => InvalidRequest,
	InvalidRequest$: () => InvalidRequest$,
	InvalidWriteOffset: () => InvalidWriteOffset,
	InvalidWriteOffset$: () => InvalidWriteOffset$,
	NoSuchAnnotation: () => NoSuchAnnotation,
	NoSuchAnnotation$: () => NoSuchAnnotation$,
	NoSuchBucket: () => NoSuchBucket,
	NoSuchBucket$: () => NoSuchBucket$,
	NoSuchKey: () => NoSuchKey,
	NoSuchKey$: () => NoSuchKey$,
	NoSuchUpload: () => NoSuchUpload,
	NoSuchUpload$: () => NoSuchUpload$,
	NotFound: () => NotFound,
	NotFound$: () => NotFound$,
	ObjectAlreadyInActiveTierError: () => ObjectAlreadyInActiveTierError,
	ObjectAlreadyInActiveTierError$: () => ObjectAlreadyInActiveTierError$,
	ObjectNotInActiveTierError: () => ObjectNotInActiveTierError,
	ObjectNotInActiveTierError$: () => ObjectNotInActiveTierError$,
	PutObject$: () => PutObject$,
	PutObjectCommand: () => PutObjectCommand,
	PutObjectOutput$: () => PutObjectOutput$,
	PutObjectRequest$: () => PutObjectRequest$,
	S3Client: () => S3Client,
	S3ServiceException$: () => S3ServiceException$,
	SessionCredentials$: () => SessionCredentials$,
	TooManyParts: () => TooManyParts,
	TooManyParts$: () => TooManyParts$,
	UnsupportedMediaType: () => UnsupportedMediaType,
	UnsupportedMediaType$: () => UnsupportedMediaType$,
	__Client: () => import_client.Client,
	errorTypeRegistries: () => errorTypeRegistries
});
//#endregion
export { init_node_http_handler as a, require_protocols as c, init_dist_es$2 as d, SignatureV4MultiRegion as f, NodeHttpHandler as i, require_util as l, dist_es_exports$1 as n, dist_es_exports$2 as o, init_SignatureV4MultiRegion as p, init_dist_es as r, require_httpAuthSchemes as s, dist_es_exports as t, dist_es_exports$4 as u };
