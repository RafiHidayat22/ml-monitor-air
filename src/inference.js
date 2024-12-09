const tf = require('@tensorflow/tfjs-node');

// Fungsi untuk memuat model
async function loadModel() {
    try {
        const model = await tf.loadLayersModel('file://models/model.json');
        console.log('Model berhasil dimuat!');
        return model;
    } catch (error) {
        console.error('Gagal memuat model:', error);
        throw error;
    }
}

// Fungsi untuk memberikan rekomendasi spesifik
function generateRecommendation(result, ph, turbidity, temperature) {
    let recommendation = `Hasil prediksi: ${result}. `;

    // Rekomendasi umum berdasarkan hasil prediksi
    if (result === 'Baik') {
        recommendation += 'Kondisi lingkungan sudah optimal. Pertahankan parameter kualitas air berikut:';
    } else if (result === 'Sedang') {
        recommendation += 'Kondisi lingkungan memerlukan perbaikan kecil. Berikut saran untuk peningkatan:';
    } else if (result === 'Buruk') {
        recommendation += 'Kondisi lingkungan sangat buruk. Berikut langkah perbaikan yang direkomendasikan:';
    }

    // Rekomendasi spesifik berdasarkan nilai parameter
    if (ph < 6.5 || ph > 8.5) {
        recommendation += `- pH (${ph}) berada di luar batas ideal (6.5 - 8.5). Periksa dan sesuaikan pH air menggunakan penambahan asam/basa sesuai kebutuhan.`;
    } else {
        recommendation += `- pH (${ph}) sudah dalam batas ideal.`;
    }

    if (turbidity > 20) {
        recommendation += `- Kekeruhan air (${turbidity}) terlalu tinggi. Lakukan penyaringan atau perbaikan kualitas air untuk mengurangi kekeruhan.`;
    } else {
        recommendation += `- Kekeruhan air (${turbidity}) sudah pada tingkat yang aman.`;
    }

    if (temperature < 25 || temperature > 30) {
        recommendation += `- Suhu (${temperature}°C) berada di luar kisaran optimal (25 - 30°C). Pertimbangkan penggunaan sistem pengatur suhu seperti pemanas atau pendingin.`;
    } else {
        recommendation += `- Suhu (${temperature}°C) sudah berada dalam kisaran optimal.`;
    }

    return recommendation.trim();
}

// Fungsi untuk melakukan prediksi
async function predict(model, inputData) {
    return tf.tidy(() => {
        const inputTensor = tf.tensor([inputData]);
        const prediction = model.predict(inputTensor).dataSync(); // Mengambil hasil prediksi sebagai array

        let result = 'Buruk'; // Default kategori
        if (prediction[0] > 0.7) {
            result = 'Baik';
        } else if (prediction[0] > 0.4) {
            result = 'Sedang';
        }

        // Destructuring input data
        const [ph, turbidity, temperature] = inputData;

        // Dapatkan rekomendasi spesifik berdasarkan nilai input
        const recommendation = generateRecommendation(result, ph, turbidity, temperature);

        return { result, recommendation };
    });
}

module.exports = { loadModel, predict };
