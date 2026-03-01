1. Créer le CT LXC
Dans l'interface web Proxmox, va dans le stockage local et télécharge d'abord un template. Debian 12 (Bookworm) est le choix le plus fiable pour Docker.
Stockage local → CT Templates → Templates → cherche "debian-12-standard" → Télécharger
Ensuite, crée le CT :
Create CT (bouton en haut à droite), puis configure :

General : donne-lui un hostname (ex: docker-stack), définis un mot de passe root
Template : sélectionne le debian-12 téléchargé
Disks : 32 GB suffisent largement (les données Docker + Postgres)
CPU : 2 cores
Memory : 4096 MB (RAM), 2048 MB (Swap)
Network : bridge vmbr0, DHCP ou IP statique selon ta préférence (une IP statique c'est mieux pour un serveur, ex: 192.168.1.50/24, gateway 192.168.1.1)
DNS : laisse par défaut (hérite de l'hôte)

Important : décoche "Start after created", on doit d'abord configurer.
2. Activer les options nécessaires pour Docker
C'est la partie clé. Depuis le shell Proxmox (pas le CT), édite la config du CT. Si ton CT a l'ID 101 par exemple :
bashnano /etc/pve/lxc/101.conf
Ajoute ces lignes à la fin :
conffeatures: keyctl=1,nesting=1
C'est ce qui permet à Docker de fonctionner dans le CT. Sans nesting, Docker ne pourra pas créer ses propres namespaces.
3. Démarrer et configurer le CT
Démarre le CT depuis l'interface Proxmox, puis ouvre sa console. Dedans :
bash# Mise à jour
apt update && apt upgrade -y

# Installer les dépendances
apt install -y ca-certificates curl gnupg

# Ajouter le repo Docker officiel
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Vérifier que ça tourne
docker run hello-world
Si le hello-world s'affiche, Docker est prêt.
4. Déployer ton stack
Crée un répertoire pour ton projet :
bashmkdir -p /opt/app
cd /opt/app
Copie ton docker-compose.yml dedans (via nano, scp, ou comme tu préfères), puis :
bashdocker compose up -d
5. Conseils pour la suite
IP statique — si tu es en DHCP, note l'IP du CT (ip a) et configure ton routeur pour lui réserver cette IP via le bail DHCP, ou passe en statique dans la config réseau du CT.
Persistance Postgres — assure-toi que ton compose monte un volume pour /var/lib/postgresql/data, sinon tu perds tes données si le container est recréé.
Backups — côté Proxmox, tu peux snapshotter le CT entier. C'est un des gros avantages de cette approche.
Cloudflare Tunnel — tu pourras l'ajouter directement dans ton docker-compose.yml comme service supplémentaire quand tu seras prêt.
Tu veux que je t'aide sur une de ces étapes en particulier, ou on passe à la config du Cloudflare Tunnel ?