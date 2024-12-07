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

// Fungsi untuk melakukan prediksi
async function predict(model, inputData) {
    return tf.tidy(() => {
        const inputTensor = tf.tensor([inputData]);
        const prediction = model.predict(inputTensor).dataSync(); // Gunakan dataSync()
        
        let result = 'buruk'; // Default kategori buruk
        if (prediction[0] > 0.6) {
            result = 'baik';
        } else if (prediction[0] > 0.3) {
            result = 'sedang';
        }
        return result;
    });
}

module.exports = { loadModel, predict };
