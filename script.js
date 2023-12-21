// Author   : Wildy Sheverando
// Contact  : hai@wildyrando.com
// License  : MIT License
// Repo     : https://github.com/wildyrando/Bee-Shorter.git

// Inisialisasi
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

// konfigurasi lebah
var beeSize = 80;
var beeSpeed = 0.1;
var beeScore = 0;
var beeLevel = 1;
var beeShielded = false;
var beeImage = new Image();
beeImage.src = "assets/beeenemy.png";
var bees = [];
var shieldCount = 0; // Tambahkan variabel shieldCount

// konfigurasi pistol
var pistolSize = 60;
var pistolImage = new Image();
pistolImage.src = "assets/pistol.png";
var pistol = {
    x: canvas.width / 2 - pistolSize / 2,
    y: canvas.height - pistolSize,
    size: pistolSize,
};

// konfigurasi peluru pistol
var bulletSize = 30;
var bulletSpeed = 5;
var bulletVisible = false;
var bulletImage = new Image();
bulletImage.src = "assets/bullet.png";
var bullet = {
    x: 0,
    y: 0,
    size: bulletSize,
};

// konfigurasi peluru lebah
var beeBulletSize = 30;
var beeBulletSpeed = 1;
var beeBulletVisible = false;
var beeBulletImage = new Image();
beeBulletImage.src = "assets/bullet-bee.png";
var beeBullet = {
    x: 0,
    y: 0,
    size: beeBulletSize,
};

// declare keys
var keys = {};

// Mendeteksi tombol yang ditekan
window.addEventListener("keydown", function (event) {
    keys[event.keyCode] = true;
    if (event.keyCode === 32 && !bulletVisible) {
        shoot();
    }
});

// konfigurasi keyup key
window.addEventListener("keyup", function (event) {
    delete keys[event.keyCode];
});

// Membuat lebah
function createBees() {
    var rowCount = 6;
    var startX = 100;
    var startY = 50;
    var paddingX = 80;
    var paddingY = 60;

    for (var row = 0; row < rowCount; row++) {
        for (var col = 0; col < rowCount - row; col++) {
        var bee = {
            x: startX + col * paddingX + (row * paddingX) / 2,
            y: startY + row * paddingY,
            size: beeSize,
            direction: 1,
            shooting: false,
            shielded: false,
        };
        bees.push(bee);
        }
    }
}

// Membuat latar belakang
function drawBackground() {
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

// Membuat lebah
function drawBees() {
    for (var i = 0; i < bees.length; i++) {
        var bee = bees[i];
        context.drawImage(beeImage, bee.x, bee.y, bee.size, bee.size);
    }
}

// Membuat pistol
function drawPistol() {
    context.drawImage(pistolImage, pistol.x, pistol.y, pistol.size, pistol.size);
    var lineY = pistol.y - 5;
    context.beginPath();
    context.moveTo(0, lineY);
    context.lineTo(canvas.width, lineY);
    context.strokeStyle = "red";
    context.lineWidth = 2;
    context.stroke();
}

// Membuat peluru
function drawBullet() {
    if (bulletVisible) {
        context.drawImage(
        bulletImage,
        bullet.x,
        bullet.y,
        bullet.size,
        bullet.size
        );
    }
}

// Membuat peluru lebah
function drawBeeBullet() {
    if (beeBulletVisible) {
        context.drawImage(
        beeBulletImage,
        beeBullet.x,
        beeBullet.y,
        beeBullet.size,
        beeBullet.size
        );
    }
}

// di gunakan untuk mengupdate poisisi peluru dari lebah
function updateBeeBulletPosition() {
    if (beeBulletVisible) {
        beeBullet.y += beeBulletSpeed;
        if (beeBullet.y > canvas.height) {
            beeBulletVisible = false;
        }
    }
}

// Mengupdate posisi lebah
function updateBeePosition() {
    for (var i = 0; i < bees.length; i++) {
        var bee = bees[i];
        if (beeLevel > 1) {
            bee.y += beeSpeed * bee.direction;
        }
        if (bee.y + bee.size >= canvas.height) {
            // Jika lebah mencapai bagian bawah, game berakhir
            endGame();
        }

        if (beeLevel === 2) {
            bee.x += beeSpeed * bee.direction;
            if (bee.x <= 0 || bee.x + bee.size >= canvas.width) {
                bee.direction *= -1;
            }
        }

        if (beeLevel === 4 && !beeBulletVisible && Math.random() < 0.01) {
            var randomBee = bees[Math.floor(Math.random() * bees.length)];
            createBeeBullet(randomBee);
            shootBeeBullet(randomBee);
        }
    }
}

// Memeriksa tabrakan antara lebah dan peluru
function checkCollision() {
    for (var i = 0; i < bees.length; i++) {
        var bee = bees[i];

        // validasi bahwa bullet visible dan bullet datanya sudah benar
        if (
            bulletVisible &&
            bullet.x < bee.x + bee.size &&
            bullet.x + bullet.size > bee.x &&
            bullet.y < bee.y + bee.size &&
            bullet.y + bullet.size > bee.y
        ) {
            if (beeShielded) {
                var backgroundSound = document.getElementById("shootSound");
                backgroundSound.currentTime = 0;
                backgroundSound.play();
                bee.shielded = false;
                shieldCount--;
                if (shieldCount === 0) {
                    beeShielded = false;
                }
                beeScore += 100;
            } else if (!beeShielded) {
                var backgroundSound = document.getElementById("shootSound");
                backgroundSound.currentTime = 0;
                backgroundSound.play();
                beeScore += 100;
                bees.splice(i, 1);
            }
            bulletVisible = false;
            resetBullet();
            break;
        }

        // validasi bahwa beelevel sudah 4 jika sudah dan semua lebah udh habis maka endgame
        if (
            beeLevel === 4 &&
            beeBulletVisible &&
            beeBullet.x < pistol.x + pistol.size &&
            beeBullet.x + beeBullet.size > pistol.x &&
            beeBullet.y < pistol.y + pistol.size &&
            beeBullet.y + beeBullet.size > pistol.y
        ) {
            endGame();
        }
    }
}

// Memperbarui level permainan
function updateLevel() {
    if (beeScore >= 200 && beeLevel === 1) {
        beeLevel = 2;
    } else if (beeScore >= 400 && beeLevel === 2) {
        beeLevel = 3;
        beeShielded = true;
        shieldCount = 2; // Set jumlah shieldCount menjadi 2
    } else if (beeScore >= 600 && beeLevel === 3) {
        beeLevel = 4;
    } else if (bees.length === 0 && beeLevel === 4) {
        clearInterval(gameInterval);
        drawGameWin();
    }
}

// Mengupdate posisi peluru
function updateBulletPosition() {
    if (bulletVisible) {
        bullet.y -= bulletSpeed;
        if (bullet.y < 0) {
            bulletVisible = false;
            resetBullet();
        }
    }
}

// function untuk membuat bullet pada lebah
function createBeeBullet(bee) {
    beeBullet = {
        x: bee.x + bee.size / 2 - beeBullet.size / 2,
        y: bee.y + bee.size,
        size: beeBulletSize,
    };
    bee.shooting = true;
    beeBulletVisible = true;
}

// Mengatur ulang posisi peluru
function resetBullet() {
    bullet.x = pistol.x + pistol.size / 2 - bullet.size / 2;
    bullet.y = pistol.y - bullet.size;
}

// Menembak
function shoot() {
    bulletVisible = true;
    bullet.x = pistol.x + pistol.size / 2 - bullet.size / 2;
    bullet.y = pistol.y - bullet.size;
}

// Menembak peluru lebah
function shootBeeBullet(bee) {
    beeBulletVisible = true;
    beeBullet.x = bee.x + bee.size / 2 - beeBullet.size / 2;
    beeBullet.y = bee.y + bee.size;
}

// Melakukan tembakan otomatis
function autoShoot() {
    if (Math.random() < 0.02) {
        shoot();
    }
}

// Membuat output score yang didapat
function drawScore() {
    context.fillStyle = "#000000";
    context.font = "20px Arial";
    context.fillText("Score: " + beeScore, 20, 30);
    context.fillText("Level: " + beeLevel, 20, 60);
}

// Berfungsi untuk mengerakan pistol
function movePistol() {
    if (37 in keys) {
        // tombol left
        pistol.x -= 5;
        if (pistol.x < 0) {
            pistol.x = 0;
        }
    }
    if (39 in keys) {
        // tombol right
        pistol.x += 5;
        if (pistol.x + pistol.size > canvas.width) {
            pistol.x = canvas.width - pistol.size;
        }
    }
}

// Menggambar pesan akhir
function drawGameOver() {
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
    document.getElementById("tryAgainButton").classList.remove("hidden");
    var gameOverSound = new Audio("assets/gameover.mp3");
    gameOverSound.play();
    var backgroundSound = document.getElementById("backgroundSound");
    backgroundSound.pause();
}

// Menggambar pesan kemenangan
function drawGameWin() {
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.fillText("You Win!", canvas.width / 2 - 80, canvas.height / 2);
    document.getElementById("tryAgainButton").classList.remove("hidden");
    var winSound = new Audio("assets/win.mp3");
    winSound.play();
    var backgroundSound = document.getElementById("backgroundSound");
    backgroundSound.pause();
}

// Menghentikan permainan
function endGame() {
    clearInterval(gameInterval);
    drawGameOver();
}

// Memeriksa kondisi kemenangan
function checkWin() {
    if (bees.length === 0 && beeLevel === 4 && !beeBulletVisible) {
        clearInterval(gameInterval);
        drawGameWin();
    }
}

// Memeriksa tabrakan antara lebah dan pistol
function checkBeeCollision() {
    for (var i = 0; i < bees.length; i++) {
        var bee = bees[i];
        if (
            bee.x < pistol.x + pistol.size &&
            bee.x + bee.size > pistol.x &&
            bee.y + bee.size > pistol.y &&
            bee.y < pistol.y + pistol.size
        ) {
            endGame();
            break;
        }
    }
}

// Menggambar objek di layar
function draw() {
    drawBackground();
    drawBees();
    drawPistol();
    drawBullet();
    drawBeeBullet();
    drawScore();
}

// Mengupdate posisi objek
function update() {
    updateBeePosition();
    checkCollision();
    updateLevel();
    updateBeeBulletPosition();
    updateBulletPosition();
    checkWin();
    autoShoot();
    movePistol();
    checkBeeCollision();
}

// Memulai permainan
function startGame() {
    document.getElementById("startButton").classList.add("hidden");
    document.getElementById("tryAgainButton").classList.add("hidden");
    var backgroundSound = document.getElementById("backgroundSound");
    backgroundSound.currentTime = 0;
    backgroundSound.play();
    createBees();
    gameInterval = setInterval(function () {
        draw();
        update();
    }, 10);
}

// Mencoba lagi
function tryAgain() {
    location.reload();
}

// Mengatur ulang posisi pistol saat jendela diubah ukurannya
window.addEventListener("resize", function () {
    pistol.x = canvas.width / 2 - pistol.size / 2;
});

// Memulai permainan saat tombol Start diklik
document.getElementById("startButton").addEventListener("click", startGame);

// Mencoba lagi saat tombol Try Again diklik
document.getElementById("tryAgainButton").addEventListener("click", tryAgain);

// Menggambar pesan awal
context.fillStyle = "black";
context.font = "40px Arial";
context.fillText("Bee Shooter", canvas.width / 2 - 120, canvas.height / 2 - 40);
document.getElementById("startButton").classList.remove("hidden");
