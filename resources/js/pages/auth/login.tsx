// import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
// import InputError from '@/components/input-error';
// import TextLink from '@/components/text-link';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import AuthLayout from '@/layouts/auth-layout';
// import { register } from '@/routes';
// import { request } from '@/routes/password';
// import { Form, Head } from '@inertiajs/react';
// import { LoaderCircle } from 'lucide-react';

// interface LoginProps {
//     status?: string;
//     canResetPassword: boolean;
// }

// export default function Login({ status, canResetPassword }: LoginProps) {
//     return (
//         <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
//             <Head title="Log in" />

//             <Form {...AuthenticatedSessionController.store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
//                 {({ processing, errors }) => (
//                     <>
//                         <div className="grid gap-6">
//                             <div className="grid gap-2">
//                                 <Label htmlFor="email">Email address</Label>
//                                 <Input
//                                     id="email"
//                                     type="email"
//                                     name="email"
//                                     required
//                                     autoFocus
//                                     tabIndex={1}
//                                     autoComplete="email"
//                                     placeholder="email@example.com"
//                                 />
//                                 <InputError message={errors.email} />
//                             </div>

//                             <div className="grid gap-2">
//                                 <div className="flex items-center">
//                                     <Label htmlFor="password">Password</Label>
//                                     {canResetPassword && (
//                                         <TextLink href={request()} className="ml-auto text-sm" tabIndex={5}>
//                                             Forgot password?
//                                         </TextLink>
//                                     )}
//                                 </div>
//                                 <Input
//                                     id="password"
//                                     type="password"
//                                     name="password"
//                                     required
//                                     tabIndex={2}
//                                     autoComplete="current-password"
//                                     placeholder="Password"
//                                 />
//                                 <InputError message={errors.password} />
//                             </div>

//                             <div className="flex items-center space-x-3">
//                                 <Checkbox id="remember" name="remember" tabIndex={3} />
//                                 <Label htmlFor="remember">Remember me</Label>
//                             </div>

//                             <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing} data-test="login-button">
//                                 {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
//                                 Log in
//                             </Button>
//                         </div>

//                         <div className="text-center text-sm text-muted-foreground">
//                             Don't have an account?{' '}
//                             <TextLink href={register()} tabIndex={5}>
//                                 Sign up
//                             </TextLink>
//                         </div>
//                     </>
//                 )}
//             </Form>

//             {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
//         </AuthLayout>
//     );
// }
// --------------------------------------------------------------------------------------------------
import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <>
            <Head title="Login" />

            <div className="flex min-h-screen">
                {/* Imagen izquierda */}
                <div className="hidden md:flex w-1/2 bg-gray-100 dark:bg-gray-950 items-center justify-center">
                    <img
                        src="/images/login-default.webp"
                        alt="Imagen Login"
                        className="max-w-full max-h-[80%] object-contain rounded-xl shadow-2xl"
                    />
                </div>

                {/* Login derecha */}
                <div className="w-full md:w-1/2 flex items-center justify-center bg-white dark:bg-black p-6">
                    <div className="w-full max-w-md p-8 border-4 border-indigo-600 shadow-[0_0_50px_rgba(99,102,241,0.7)] rounded-xl bg-white dark:bg-neutral-900">
                        <img src="/logo.svg" alt="Logo" className="h-12 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-center mb-2 text-indigo-700 dark:text-indigo-300">
                            Inicia sesión en tu cuenta
                        </h2>
                        <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-6">
                            Para iniciar sesión, introduzca su correo electrónico y contraseña a continuación.
                        </p>

                        <Form {...AuthenticatedSessionController.store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className="dark:text-gray-300">Correo electrónico</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="email@example.com"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password" className="dark:text-gray-300">Contraseña</Label>
                                                {canResetPassword && (
                                                    <TextLink href={request()} className="ml-auto text-sm" tabIndex={5}>
                                                        ¿Has olvidado tu contraseña?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Password"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Checkbox id="remember" name="remember" tabIndex={3} />
                                            <Label htmlFor="remember" className="dark:text-gray-300">Acuérdate de mí</Label>
                                        </div>

                                        <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing} data-test="login-button">
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                            Acceso
                                        </Button>
                                    </div>

                                    <div className="text-muted-foreground dark:text-gray-400 text-center text-sm">
                                        Don't have an account?{' '}
                                        <TextLink href={register()} tabIndex={5}>
                                            Sign up
                                        </TextLink>
                                    </div>
                                </>
                            )}
                        </Form>

                        {status && <div className="mt-4 text-center text-sm font-medium text-green-600">{status}</div>}
                    </div>
                </div>
            </div>
        </>
    );
}
