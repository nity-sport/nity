/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Você pode ter outras configurações aqui
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'nity-assets.s3.us-east-2.amazonaws.com',
          port: '', // Deixe em branco para a porta padrão (443 para https)
          pathname: '/**', // Permite qualquer caminho dentro deste hostname
        },
        // Você pode adicionar outros hostnames aqui se necessário
        // Exemplo para placeholders locais se você os tiver na pasta public:
        // {
        //   protocol: 'http', // ou https se seu dev server usar
        //   hostname: 'localhost',
        // },
      ],
    },
    // Configuração para permitir arquivos até 5MB (após compressão)
    api: {
      bodyParser: {
        sizeLimit: '5mb',
      },
    },
    // Outras configurações do Next.js podem estar aqui...
  };
  
  module.exports = nextConfig;