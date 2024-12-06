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

// Fungsi untuk prediksi klasifikasi
async function predictClassification(model, inputData) {
    try {
        // Standarisasi atau normalisasi data input (jika diperlukan)
        const mean = [7.0, 5.0, 25.0]; // Contoh nilai rata-rata untuk masing-masing fitur
        const stdDev = [1.0, 1.0, 5.0]; // Contoh nilai standar deviasi untuk masing-masing fitur
        const normalizedInput = inputData.map((value, index) => (value - mean[index]) / stdDev[index]);

        // Membuat tensor 2D
        const tensor = tf.tensor2d([normalizedInput], [1, inputData.length]);

        // Melakukan prediksi
        const predictionTensor = model.predict(tensor);
        const prediction = await predictionTensor.data();

        // Debug nilai prediksi mentah
        console.log('Prediksi mentah:', prediction);

        // Kelas yang mungkin
        const classes = ['Baik', 'Sedang', 'Buruk'];

        // Mendapatkan indeks kelas dengan nilai tertinggi
        const classResult = tf.argMax(predictionTensor).dataSync()[0]; // axis = 1 untuk batch prediksi
        const label = classes[classResult];

        // Menyusun penjelasan dan saran berdasarkan label
        let explanation, suggestion;

        if (label === 'Baik') {
            explanation = "Kondisi Baik";
            suggestion = "Segera konsultasi dengan dokter terdekat jika ukuran semakin membesar dengan cepat, mudah luka atau berdarah.";
        } else if (label === 'Sedang') {
            explanation = "Kondisi sedang.";
            suggestion = "Segera konsultasi dengan dokter terdekat untuk meminimalisasi penyebaran kanker.";
        } else if (label === 'Buruk') {
            explanation = "Kondisi buruk.";
            suggestion = "Segera konsultasi dengan dokter terdekat untuk mengetahui detail terkait tingkat bahaya penyakit.";
        }

        // Confidence score
        const confidenceScore = prediction[classResult];

        // Debug confidence score
        console.log('Confidence score:', confidenceScore);

        return { confidenceScore, label, explanation, suggestion };
    } catch (error) {
        console.error('Error saat melakukan prediksi:', error);
        throw error;
    }
}

module.exports = { predictClassification, loadModel };
