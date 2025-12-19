# 🚀 Guide de Déploiement sur Render.com

Guide complet pour déployer votre application ALTIMANCE sur Render.com.

## 📋 Prérequis

- ✅ Compte GitHub, GitLab ou Bitbucket
- ✅ Compte Render.com (gratuit)
- ✅ Votre code doit être dans un repository Git

---

## 🔧 Étape 1 : Préparer votre Repository Git

### Si vous n'avez pas encore de repository Git :

1. **Initialiser Git dans votre projet** :
   ```bash
   cd c:\Users\hp\Downloads\altimance
   git init
   git add .
   git commit -m "Initial commit - ALTIMANCE project"
   ```

2. **Créer un repository sur GitHub** :
   - Allez sur [github.com](https://github.com)
   - Cliquez sur "New repository"
   - Nommez-le `altimance`
   - **NE PAS** initialiser avec README (vous en avez déjà un)
   - Cliquez sur "Create repository"

3. **Pousser votre code sur GitHub** :
   ```bash
   git remote add origin https://github.com/VOTRE-USERNAME/altimance.git
   git branch -M main
   git push -u origin main
   ```

---

## 🌐 Étape 2 : Créer un compte Render.com

1. Allez sur [render.com](https://render.com)
2. Cliquez sur "Get Started for Free"
3. Inscrivez-vous avec GitHub (recommandé) ou email
4. Vérifiez votre email si nécessaire

---

## 🚀 Étape 3 : Déployer sur Render

### Option A : Déploiement automatique avec render.yaml (Recommandé)

1. **Connecter votre repository** :
   - Dans le dashboard Render, cliquez sur "New +"
   - Sélectionnez "Blueprint"
   - Connectez votre compte GitHub/GitLab
   - Sélectionnez le repository `altimance`
   - Render détectera automatiquement le fichier `render.yaml`

2. **Configurer les variables d'environnement** :
   - Render générera automatiquement `JWT_SECRET`
   - Vérifiez que `PORT` est défini à `10000`

3. **Déployer** :
   - Cliquez sur "Apply"
   - Attendez que le déploiement se termine (3-5 minutes)

### Option B : Déploiement manuel

1. **Créer un Web Service** :
   - Dans le dashboard Render, cliquez sur "New +"
   - Sélectionnez "Web Service"
   - Connectez votre repository GitHub

2. **Configuration du service** :
   - **Name** : `altimance`
   - **Runtime** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : `Free`

3. **Variables d'environnement** :
   Ajoutez ces variables dans la section "Environment" :
   ```
   NODE_ENV=production
   JWT_SECRET=<générez une clé secrète aléatoire>
   PORT=10000
   ```

4. **Ajouter un disque persistant** :
   - Allez dans l'onglet "Disks"
   - Cliquez sur "Add Disk"
   - **Name** : `altimance-data`
   - **Mount Path** : `/opt/render/project/src`
   - **Size** : `1 GB`

5. **Déployer** :
   - Cliquez sur "Create Web Service"
   - Attendez que le déploiement se termine

---

## ✅ Étape 4 : Vérifier le déploiement

1. **Accéder à votre application** :
   - URL : `https://altimance.onrender.com` (ou l'URL fournie par Render)
   - Admin : `https://altimance.onrender.com/admin`

2. **Tester la connexion admin** :
   - Username : `admin`
   - Password : `admin123`

3. **Vérifier les fonctionnalités** :
   - ✅ Formulaire de contact
   - ✅ Upload de CV
   - ✅ Dashboard admin
   - ✅ Gestion des opportunités

---

## 🔒 Sécurité Post-Déploiement

> [!CAUTION]
> **IMPORTANT** : Changez le mot de passe admin par défaut immédiatement après le premier déploiement !

### Générer un JWT_SECRET sécurisé :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez le résultat et mettez-le dans les variables d'environnement Render.

---

## 📊 Surveillance et Logs

1. **Voir les logs en temps réel** :
   - Dashboard Render → Votre service → Onglet "Logs"

2. **Redémarrer le service** :
   - Dashboard Render → Votre service → "Manual Deploy" → "Clear build cache & deploy"

---

## 🔄 Mises à jour automatiques

Render redéploiera automatiquement votre application à chaque fois que vous poussez du code sur la branche `main` :

```bash
git add .
git commit -m "Mise à jour de l'application"
git push origin main
```

---

## 🆘 Dépannage

### Problème : L'application ne démarre pas
- **Solution** : Vérifiez les logs dans le dashboard Render
- Assurez-vous que `npm install` s'est bien exécuté

### Problème : Base de données vide après redéploiement
- **Solution** : Vérifiez que le disque persistant est bien configuré
- Le mount path doit être `/opt/render/project/src`

### Problème : Les uploads de CV ne fonctionnent pas
- **Solution** : Le disque persistant doit être configuré
- Vérifiez que le dossier `uploads/` est créé automatiquement

### Problème : Erreur JWT
- **Solution** : Vérifiez que `JWT_SECRET` est bien défini dans les variables d'environnement

---

## 💰 Plan Gratuit Render

Le plan gratuit inclut :
- ✅ 750 heures/mois (suffisant pour un site 24/7)
- ✅ 1 GB de disque persistant
- ✅ SSL automatique (HTTPS)
- ⚠️ Le service s'endort après 15 minutes d'inactivité (redémarre en ~30 secondes)

---

## 📞 Support

- Documentation Render : [docs.render.com](https://docs.render.com)
- Community Forum : [community.render.com](https://community.render.com)

---

## 🎉 Félicitations !

Votre application ALTIMANCE est maintenant déployée et accessible en ligne ! 🚀
