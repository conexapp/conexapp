import { o as __toESM, r as __exportAll } from "../../_runtime.mjs";
import { d as require_config, r as require_client } from "./checksums+[...].mjs";
//#region node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveCredentialSource.js
var import_client = require_client();
var import_config = require_config();
var resolveCredentialSource = (credentialSource, profileName, logger) => {
	const sourceProvidersMap = {
		EcsContainer: async (options) => {
			const { fromHttp } = await import("./credential-provider-http+[...].mjs").then((n) => n.t);
			const { fromContainerMetadata } = await import("../@smithy/credential-provider-imds+[...].mjs").then((n) => n.t);
			logger?.debug("@aws-sdk/credential-provider-ini - credential_source is EcsContainer");
			return async () => (0, import_config.chain)(fromHttp(options ?? {}), fromContainerMetadata(options))().then(setNamedProvider);
		},
		Ec2InstanceMetadata: async (options) => {
			logger?.debug("@aws-sdk/credential-provider-ini - credential_source is Ec2InstanceMetadata");
			const { fromInstanceMetadata } = await import("../@smithy/credential-provider-imds+[...].mjs").then((n) => n.t);
			return async () => fromInstanceMetadata(options)().then(setNamedProvider);
		},
		Environment: async (options) => {
			logger?.debug("@aws-sdk/credential-provider-ini - credential_source is Environment");
			const { fromEnv } = await import("./client-s3+[...].mjs").then((n) => n.o);
			return async () => fromEnv(options)().then(setNamedProvider);
		}
	};
	if (credentialSource in sourceProvidersMap) return sourceProvidersMap[credentialSource];
	else throw new import_config.CredentialsProviderError(`Unsupported credential source in profile ${profileName}. Got ${credentialSource}, expected EcsContainer or Ec2InstanceMetadata or Environment.`, { logger });
};
var setNamedProvider = (creds) => (0, import_client.setCredentialFeature)(creds, "CREDENTIALS_PROFILE_NAMED_PROVIDER", "p");
//#endregion
//#region node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveAssumeRoleCredentials.js
var isAssumeRoleProfile = (arg, { profile = "default", logger } = {}) => {
	return Boolean(arg) && typeof arg === "object" && typeof arg.role_arn === "string" && ["undefined", "string"].indexOf(typeof arg.role_session_name) > -1 && ["undefined", "string"].indexOf(typeof arg.external_id) > -1 && ["undefined", "string"].indexOf(typeof arg.mfa_serial) > -1 && (isAssumeRoleWithSourceProfile(arg, {
		profile,
		logger
	}) || isCredentialSourceProfile(arg, {
		profile,
		logger
	}));
};
var isAssumeRoleWithSourceProfile = (arg, { profile, logger }) => {
	const withSourceProfile = typeof arg.source_profile === "string" && typeof arg.credential_source === "undefined";
	if (withSourceProfile) logger?.debug?.(`    ${profile} isAssumeRoleWithSourceProfile source_profile=${arg.source_profile}`);
	return withSourceProfile;
};
var isCredentialSourceProfile = (arg, { profile, logger }) => {
	const withProviderProfile = typeof arg.credential_source === "string" && typeof arg.source_profile === "undefined";
	if (withProviderProfile) logger?.debug?.(`    ${profile} isCredentialSourceProfile credential_source=${arg.credential_source}`);
	return withProviderProfile;
};
var resolveAssumeRoleCredentials = async (profileName, profiles, options, callerClientConfig, visitedProfiles = {}, resolveProfileData) => {
	options.logger?.debug("@aws-sdk/credential-provider-ini - resolveAssumeRoleCredentials (STS)");
	const profileData = profiles[profileName];
	const { source_profile, region } = profileData;
	if (!options.roleAssumer) {
		const { getDefaultRoleAssumer } = await import("../aws-sdk__nested-clients.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		options.roleAssumer = getDefaultRoleAssumer({
			...options.clientConfig,
			credentialProviderLogger: options.logger,
			parentClientConfig: {
				...callerClientConfig,
				...options?.parentClientConfig,
				region: region ?? options?.parentClientConfig?.region ?? callerClientConfig?.region
			}
		}, options.clientPlugins);
	}
	if (source_profile && source_profile in visitedProfiles) throw new import_config.CredentialsProviderError(`Detected a cycle attempting to resolve credentials for profile ${(0, import_config.getProfileName)(options)}. Profiles visited: ` + Object.keys(visitedProfiles).join(", "), { logger: options.logger });
	options.logger?.debug(`@aws-sdk/credential-provider-ini - finding credential resolver using ${source_profile ? `source_profile=[${source_profile}]` : `profile=[${profileName}]`}`);
	const sourceCredsProvider = source_profile ? resolveProfileData(source_profile, profiles, options, callerClientConfig, {
		...visitedProfiles,
		[source_profile]: true
	}, isCredentialSourceWithoutRoleArn(profiles[source_profile] ?? {})) : (await resolveCredentialSource(profileData.credential_source, profileName, options.logger)(options))();
	if (isCredentialSourceWithoutRoleArn(profileData)) return sourceCredsProvider.then((creds) => (0, import_client.setCredentialFeature)(creds, "CREDENTIALS_PROFILE_SOURCE_PROFILE", "o"));
	else {
		const params = {
			RoleArn: profileData.role_arn,
			RoleSessionName: profileData.role_session_name || `aws-sdk-js-${Date.now()}`,
			ExternalId: profileData.external_id,
			DurationSeconds: parseInt(profileData.duration_seconds || "3600", 10)
		};
		const { mfa_serial } = profileData;
		if (mfa_serial) {
			if (!options.mfaCodeProvider) throw new import_config.CredentialsProviderError(`Profile ${profileName} requires multi-factor authentication, but no MFA code callback was provided.`, {
				logger: options.logger,
				tryNextLink: false
			});
			params.SerialNumber = mfa_serial;
			params.TokenCode = await options.mfaCodeProvider(mfa_serial);
		}
		const sourceCreds = await sourceCredsProvider;
		return options.roleAssumer(sourceCreds, params).then((creds) => (0, import_client.setCredentialFeature)(creds, "CREDENTIALS_PROFILE_SOURCE_PROFILE", "o"));
	}
};
var isCredentialSourceWithoutRoleArn = (section) => {
	return !section.role_arn && !!section.credential_source;
};
//#endregion
//#region node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveLoginCredentials.js
var isLoginProfile = (data) => {
	return Boolean(data && data.login_session);
};
var resolveLoginCredentials = async (profileName, options, callerClientConfig) => {
	const { fromLoginCredentials } = await import("./credential-provider-login+[...].mjs").then((n) => n.t);
	const credentials = await fromLoginCredentials({
		...options,
		profile: profileName
	})({ callerClientConfig });
	return (0, import_client.setCredentialFeature)(credentials, "CREDENTIALS_PROFILE_LOGIN", "AC");
};
//#endregion
//#region node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveProcessCredentials.js
var isProcessProfile = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.credential_process === "string";
var resolveProcessCredentials = async (options, profile) => {
	const { fromProcess } = await import("./credential-provider-process+[...].mjs").then((n) => n.t);
	const credentials = await fromProcess({
		...options,
		profile
	})();
	return (0, import_client.setCredentialFeature)(credentials, "CREDENTIALS_PROFILE_PROCESS", "v");
};
//#endregion
//#region node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveSsoCredentials.js
var resolveSsoCredentials = async (profile, profileData, options = {}, callerClientConfig) => {
	const { fromSSO } = await import("./credential-provider-sso+[...].mjs").then((n) => n.t);
	return fromSSO({
		profile,
		logger: options.logger,
		parentClientConfig: options.parentClientConfig,
		clientConfig: options.clientConfig
	})({ callerClientConfig }).then((creds) => {
		if (profileData.sso_session) return (0, import_client.setCredentialFeature)(creds, "CREDENTIALS_PROFILE_SSO", "r");
		else return (0, import_client.setCredentialFeature)(creds, "CREDENTIALS_PROFILE_SSO_LEGACY", "t");
	});
};
var isSsoProfile = (arg) => arg && (typeof arg.sso_start_url === "string" || typeof arg.sso_account_id === "string" || typeof arg.sso_session === "string" || typeof arg.sso_region === "string" || typeof arg.sso_role_name === "string");
//#endregion
//#region node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveStaticCredentials.js
var isStaticCredsProfile = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.aws_access_key_id === "string" && typeof arg.aws_secret_access_key === "string" && ["undefined", "string"].indexOf(typeof arg.aws_session_token) > -1 && ["undefined", "string"].indexOf(typeof arg.aws_account_id) > -1;
var resolveStaticCredentials = async (profile, options) => {
	options?.logger?.debug("@aws-sdk/credential-provider-ini - resolveStaticCredentials");
	const credentials = {
		accessKeyId: profile.aws_access_key_id,
		secretAccessKey: profile.aws_secret_access_key,
		sessionToken: profile.aws_session_token,
		...profile.aws_credential_scope && { credentialScope: profile.aws_credential_scope },
		...profile.aws_account_id && { accountId: profile.aws_account_id }
	};
	return (0, import_client.setCredentialFeature)(credentials, "CREDENTIALS_PROFILE", "n");
};
//#endregion
//#region node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveWebIdentityCredentials.js
var isWebIdentityProfile = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.web_identity_token_file === "string" && typeof arg.role_arn === "string" && ["undefined", "string"].indexOf(typeof arg.role_session_name) > -1;
var resolveWebIdentityCredentials = async (profile, options, callerClientConfig) => {
	const { fromTokenFile } = await import("./credential-provider-web-identity+[...].mjs").then((n) => n.t);
	const credentials = await fromTokenFile({
		webIdentityTokenFile: profile.web_identity_token_file,
		roleArn: profile.role_arn,
		roleSessionName: profile.role_session_name,
		roleAssumerWithWebIdentity: options.roleAssumerWithWebIdentity,
		logger: options.logger,
		parentClientConfig: options.parentClientConfig
	})({ callerClientConfig });
	return (0, import_client.setCredentialFeature)(credentials, "CREDENTIALS_PROFILE_STS_WEB_ID_TOKEN", "q");
};
//#endregion
//#region node_modules/@aws-sdk/credential-provider-ini/dist-es/resolveProfileData.js
var resolveProfileData = async (profileName, profiles, options, callerClientConfig, visitedProfiles = {}, isAssumeRoleRecursiveCall = false) => {
	const data = profiles[profileName];
	if (Object.keys(visitedProfiles).length > 0 && isStaticCredsProfile(data)) return resolveStaticCredentials(data, options);
	if (isAssumeRoleRecursiveCall || isAssumeRoleProfile(data, {
		profile: profileName,
		logger: options.logger
	})) return resolveAssumeRoleCredentials(profileName, profiles, options, callerClientConfig, visitedProfiles, resolveProfileData);
	if (isStaticCredsProfile(data)) return resolveStaticCredentials(data, options);
	if (isWebIdentityProfile(data)) return resolveWebIdentityCredentials(data, options, callerClientConfig);
	if (isProcessProfile(data)) return resolveProcessCredentials(options, profileName);
	if (isSsoProfile(data)) return await resolveSsoCredentials(profileName, data, options, callerClientConfig);
	if (isLoginProfile(data)) return resolveLoginCredentials(profileName, options, callerClientConfig);
	throw new import_config.CredentialsProviderError(`Could not resolve credentials using profile: [${profileName}] in configuration/credentials file(s).`, { logger: options.logger });
};
//#endregion
//#region node_modules/@aws-sdk/credential-provider-ini/dist-es/fromIni.js
var fromIni = (init = {}) => async ({ callerClientConfig } = {}) => {
	init.logger?.debug("@aws-sdk/credential-provider-ini - fromIni");
	const profiles = await (0, import_config.parseKnownFiles)(init);
	return resolveProfileData((0, import_config.getProfileName)({ profile: init.profile ?? callerClientConfig?.profile }), profiles, init, callerClientConfig);
};
//#endregion
//#region node_modules/@aws-sdk/credential-provider-ini/dist-es/index.js
var dist_es_exports = /* @__PURE__ */ __exportAll({ fromIni: () => fromIni });
//#endregion
export { dist_es_exports as t };
