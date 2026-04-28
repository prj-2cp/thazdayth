/**
 * USE API HOOK
 * A standardized way to perform API calls with automatic:
 * - Base URL injection
 * - Authentication token handling
 * - Error Toasting
 * - Response JSON parsing
 */

import { useCallback, useState } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import API_URL from '@/config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiOptions {
    method?: HttpMethod;
    body?: any;
    headers?: Record<string, string>;
    skipToast?: boolean;
}

export const useApi = () => {
    const { token, logout } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const request = useCallback(async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
        const { method = 'GET', body, headers = {}, skipToast = false } = options;

        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...headers,
        };

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method,
                headers: defaultHeaders,
                body: body ? JSON.stringify(body) : undefined,
            });

            const responseText = await response.text();
            let data: any;
            try {
                data = responseText ? JSON.parse(responseText) : null;
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                data = null;
            }

            if (!response.ok) {
                // If unauthorized (401), we automatically logout
                if (response.status === 401) {
                    logout();
                    throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
                }

                const message = data.message || 'Une erreur est survenue.';
                if (!skipToast) {
                    toast({
                        title: 'Erreur',
                        description: message,
                        variant: 'destructive',
                    });
                }
                throw new Error(message);
            }

            return data as T;
        } catch (error: any) {
            console.error(`[API ERROR] ${method} ${endpoint}:`, error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [token, logout, toast]);

    return { request, loading };
};
