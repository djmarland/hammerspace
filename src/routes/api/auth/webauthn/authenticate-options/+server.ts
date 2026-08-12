import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { prisma } from '@/lib/db';
import { credentialIdToBase64url, storeChallenge } from '@/lib/webauthn';

export const POST: RequestHandler = async () => {
	try {
		const user = await prisma.user.findFirst({
			where: { isAdmin: true },
			include: {
				credentials: {
					select: {
						credentialId: true,
						transports: true
					}
				}
			}
		});

		if (!user || user.credentials.length === 0) {
			return json(
				{ error: 'No admin passkey available' },
				{ status: 400 }
			);
		}

		const allowCredentials = user.credentials.map((cred) => ({
			id: credentialIdToBase64url(cred.credentialId)
		}));

		const options = await generateAuthenticationOptions({
			rpID: process.env.NEXT_PUBLIC_RP_ID || 'localhost',
			userVerification: 'preferred',
			allowCredentials
		});

		await storeChallenge(user.id, options.challenge);

		return json(options);
	} catch (error) {
		console.error('Error generating authentication options:', error);
		return json(
			{ error: 'Failed to generate authentication options' },
			{ status: 500 }
		);
	}
};
