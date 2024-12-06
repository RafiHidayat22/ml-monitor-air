const Hapi = require('@hapi/hapi');
const { loadModel, predictClassification } = require('./inference'); // Asumsi inferensi model telah benar

let model;

// Fungsi untuk memulai server Hapi
const startServer = async () => {
    try {
        // Memuat model saat aplikasi dijalankan
        model = await loadModel();

        // Membuat instance server Hapi
        const server = Hapi.server({
            port: 3000,
            host: 'localhost',
        });

        // Route untuk prediksi
        server.route({
            method: 'POST',
            path: '/predict',
            handler: async (request, h) => {
                try {
                    // Mengambil data dari payload request
                    const { ph, turbidity, temperature } = request.payload;

                    // Memeriksa jika data input ada dan valid
                    if (ph === undefined || turbidity === undefined || temperature === undefined) {
                        return h.response({
                            status: 'fail',
                            message: 'Semua parameter (ph, turbidity, temperature) harus disertakan dalam request.'
                        }).code(400);
                    }

                    // Memastikan bahwa input berupa angka
                    if (isNaN(ph) || isNaN(turbidity) || isNaN(temperature)) {
                        return h.response({
                            status: 'fail',
                            message: 'Parameter ph, turbidity, dan temperature harus berupa angka.'
                        }).code(400);
                    }

                    // Prediksi dengan model
                    const { confidenceScore, label, explanation, suggestion } = await predictClassification(model, [ph, turbidity, temperature]);

                    // Menyusun data untuk respons
                    const data = {
                        result: label,
                        explanation: explanation,
                        suggestion: suggestion,
                        confidenceScore: confidenceScore, // Menambahkan score keyakinan
                    };

                    // Mengirim respons sukses
                    return h.response({
                        status: 'success',
                        message: 'Prediksi model berhasil.',
                        data
                    }).code(201);

                } catch (error) {
                    console.error('Error saat memprediksi:', error);
                    return h.response({
                        status: 'error',
                        message: 'Terjadi kesalahan saat memproses prediksi.',
                        error: error.message || 'Tidak ada detail error.'
                    }).code(500);
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
