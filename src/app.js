const Hapi = require('@hapi/hapi');
const { loadModel, predict } = require('./inference'); // Asumsi inferensi model telah benar

let model;

// Fungsi untuk memulai server Hapi
const startServer = async () => {
    try {
        // Membuat instance server Hapi
        const server = Hapi.server({
            port: 3000,
            host: 'localhost',
        });

        // Route untuk memuat model dan prediksi
        server.route({
            method: 'POST',
            path: '/predict',
            handler: async (request, h) => {
                try {
                    // Memuat model setiap kali permintaan diterima
                    model = await loadModel();

                    const { ph, turbidity, temperature } = request.payload;

                    // Validasi input data
                    if (ph === undefined || turbidity === undefined || temperature === undefined) {
                        return h.response({ error: 'Input data harus mencakup ph, turbidity, dan temperature' }).code(400);
                    }

                    // Buat array input dari data yang diterima
                    const inputData = [ph, turbidity, temperature];

                    // Prediksi berdasarkan input data
                    const result = await predict(model, inputData);

                    return { result }; // Mengirimkan hasil prediksi (baik, sedang, buruk)
                } catch (error) {
                    return h.response({ error: 'Terjadi kesalahan saat memprediksi' }).code(500);
                }
            }
        });

        // Jalankan server
        await server.start();
        console.log('Server berjalan di ' + server.info.uri);
    } catch (err) {
        console.error('Gagal memulai server:', err);
        process.exit(1); // Keluar dari aplikasi jika gagal memulai server
    }
};

// Mulai server Hapi
startServer();
