const axios = require('axios').default;
const fs = require('fs');
const path = require('path');

// axios.get('https://j8ki3b991l.execute-api.ap-southeast-1.amazonaws.com/production/generate-captcha?height=60&width=490',{}).then(res => {
//     const a = res;

// });


async function fetchImage(url, imagePath) {
    const response = await axios.request({
        method: 'GET',
        url: url,
        responseType: 'stream'
    });

    const writer = fs.createWriteStream(path.resolve(__dirname, imagePath));

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

fetchImage('http://gold.bidv.com.vn/DKNHDT/CaptchaServlet', 'image.jpg')
    .then(() => console.log('Image downloaded successfully'))
    .catch(err => console.error(err));