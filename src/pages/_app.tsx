import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import 'vis-network/styles/vis-network.css'; // Import vis-network CSS globally

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}

export default MyApp;
