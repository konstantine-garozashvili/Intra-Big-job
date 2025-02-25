Dans Docker Desktop :
Ouvrez les paramètres (Settings)
Allez dans "Resources" → "WSL Integration"
Activez "Enable integration with my default WSL distro"
Activez l'intégration pour votre distribution Ubuntu (ou autre distro WSL que vous utilisez)
Cliquez sur "Apply & Restart"





wsl --install


//
Ouvrir Powershell en mode administrateur et executez ceci :

 wsl --set-default-version 2
Pour plus d'informations concernant les différences principales avec WSL 2, consultez https://aka.ms/wsl2

L’opération a réussi.
PS C:\windows\system32> wsl --shutdown
PS C:\windows\system32> docker --version
Docker version 27.5.1, build 9f9e405
//

Vous pouvez revenir dans bash :
docker-compose exec php composer require symfony/webpack-encore-bundle

docker-compose down && docker-compose build app && docker-compose up -d

docker-compose exec app npm install -D tailwindcss postcss postcss-loader @tailwindcss/forms @tailwindcss/typography

docker-compose exec app npm install --save-dev @babel/plugin-proposal-class-properties

docker-compose exec app npm install --save-dev autoprefixer

sudo groupadd docker

sudo usermod -aG docker $USER

newgrp docker

sudo chmod 666 /var/run/docker.sock

wsl -d Ubuntu

$ docker-compose exec app bash -c "cd /var/www/symfony && npm init -y && npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/typography"

wsl -d Ubuntu

cd /mnt/c/laragon/www/Intra-Big-job

docker-compose up -d --build

docker-compose exec app bash -c "cd /var/www/symfony && npm run watch"

docker-compose exec app bash -c "cd /var/www/symfony && npm install -D @tailwindcss/postcss"

docker-compose exec app bash -c "cd /var/www/symfony && npm run watch"

Solution plus élégante : Modifier votre docker-compose.yml pour ajouter un service dédié au npm run watch.

wsl -d Ubuntu

sudo docker-compose exec app bash -c "cd /var/www/symfony && echo 'module.exports = { plugins: [ require(\"tailwindcss\"), require(\"autoprefixer\"), ], }' > postcss.config.js"

sudo docker-compose exec app bash -c "cd /var/www/symfony && echo 'module.exports = { plugins: [ require(\"tailwindcss\"), require(\"autoprefixer\"), ], }' > postcss.config.js"

sudo docker-compose exec app bash -c "cd /var/www/symfony && rm -rf public/build/*"

sudo docker-compose exec app bash -c "cd /var/www/symfony && npm run build"