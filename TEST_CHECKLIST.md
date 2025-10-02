# Checklist de Test - Fonctionnalites UI

Date: 2025-10-02

---

## FONCTIONNALITE 1: SWIPE-TO-DELETE

### Prerequis
- [ ] L'application est lancee
- [ ] Onglet "Moments" est ouvert
- [ ] Au moins un moment est present dans la liste

### Test du Swipe Fluide
- [ ] Commencer a swiper un moment vers la gauche
- [ ] Observer: Le fond rouge apparait progressivement
- [ ] Observer: Aucune icone de poubelle n'est visible
- [ ] Observer: L'animation est fluide
- [ ] Continuer le swipe jusqu'au bout
- [ ] Observer: Le swipe se bloque a un certain point

### Test de l'Alerte de Confirmation
- [ ] Apres le swipe complet, une alerte apparait
- [ ] Le titre de l'alerte est: "Supprimer ce moment"
- [ ] Le message est: "Etes-vous sur de vouloir supprimer ce moment ?"
- [ ] Il y a 2 boutons: "Annuler" et "Supprimer"
- [ ] Le bouton "Supprimer" est en rouge (destructive)

### Test du Bouton "Annuler"
- [ ] Appuyer sur "Annuler"
- [ ] Observer: L'alerte se ferme
- [ ] Observer: Le moment reste dans la liste
- [ ] Observer: Le swipe se ferme avec animation

### Test du Bouton "Supprimer"
- [ ] Swiper a nouveau le meme moment
- [ ] L'alerte apparait
- [ ] Appuyer sur "Supprimer"
- [ ] Observer: Le moment disparait de la liste
- [ ] Observer: L'animation de suppression est fluide

### Resultat
- [ ] PASSE
- [ ] ECHOUE (details: _______________)

---

## FONCTIONNALITE 2: EDITION DU TITRE

### Prerequis
- [ ] L'application est lancee
- [ ] Onglet "Moments" est ouvert
- [ ] Au moins un moment est present dans la liste

### Test du Long Press
- [ ] Maintenir le doigt appuye sur un moment (long press)
- [ ] Attendre ~500ms
- [ ] Observer: Un modal d'edition s'ouvre
- [ ] Observer: Le modal monte du bas (slide-up animation)

### Test du Contenu du Modal
- [ ] Le titre du modal est: "Modifier le moment"
- [ ] Il y a un champ de texte (TextInput)
- [ ] Le champ contient le titre actuel du moment
- [ ] Le clavier apparait automatiquement
- [ ] Le curseur est dans le champ (auto-focus)
- [ ] Il y a 2 boutons: "Annuler" et "Enregistrer"

### Test du Bouton "Annuler"
- [ ] Modifier le texte dans le champ
- [ ] Appuyer sur "Annuler"
- [ ] Observer: Le modal se ferme
- [ ] Observer: Le titre du moment n'a PAS change
- [ ] Observer: L'ancien titre est toujours affiche

### Test du Bouton "Enregistrer"
- [ ] Long press sur le meme moment
- [ ] Le modal s'ouvre
- [ ] Modifier le texte (ex: "Mon moment prefere")
- [ ] Appuyer sur "Enregistrer"
- [ ] Observer: Le modal se ferme
- [ ] Observer: Le nouveau titre est affiche dans la liste

### Test de Validation
- [ ] Long press sur un autre moment
- [ ] Effacer tout le texte (champ vide)
- [ ] Appuyer sur "Enregistrer"
- [ ] Observer: Le modal ne se ferme pas OU un message d'erreur apparait

### Test de la Limite de Caracteres
- [ ] Long press sur un moment
- [ ] Essayer de taper plus de 100 caracteres
- [ ] Observer: Le champ bloque a 100 caracteres

### Resultat
- [ ] PASSE
- [ ] ECHOUE (details: _______________)

---

## FONCTIONNALITE 3: PAGE PARAMETRES

### Prerequis
- [ ] L'application est lancee
- [ ] Aller dans l'onglet "Profil" ou "Parametres"

### Test de la Section "A propos"
- [ ] Scroller jusqu'a la section "A propos"
- [ ] Observer: Il y a un item "Version"
- [ ] Observer: La version s'affiche (format: "X.X.X (buildNumber)")
- [ ] Exemple: "1.0.0 (1)"
- [ ] L'item n'est pas cliquable

### Test de la Section "Donnees"
- [ ] Scroller jusqu'a la section "Donnees"
- [ ] Observer: Il y a un item "Effacer le cache"
- [ ] Observer: Le sous-titre est "Supprimer tous vos moments"
- [ ] Observer: L'icone est une poubelle (trash-outline)
- [ ] L'item est cliquable

### Test du Bouton "Effacer le cache"
- [ ] Appuyer sur "Effacer le cache"
- [ ] Observer: Une alerte apparait
- [ ] Le titre est: "Effacer le cache"
- [ ] Le message est: "Tous vos moments seront perdus. Cette action est irreversible."
- [ ] Il y a 2 boutons: "Annuler" et "Effacer"
- [ ] Le bouton "Effacer" est en rouge (destructive)

### Test du Bouton "Annuler"
- [ ] Appuyer sur "Annuler"
- [ ] Observer: L'alerte se ferme
- [ ] Observer: Rien n'a change
- [ ] Retourner dans "Moments"
- [ ] Observer: Tous les moments sont toujours presents

### Test du Bouton "Effacer"
- [ ] Retourner dans "Profil"
- [ ] Appuyer sur "Effacer le cache"
- [ ] Appuyer sur "Effacer"
- [ ] Observer: Une alerte de succes apparait
- [ ] Le message est: "Cache efface avec succes"
- [ ] Appuyer sur "OK"

### Test de la Suppression Complete
- [ ] Retourner dans l'onglet "Moments"
- [ ] Observer: La liste est vide
- [ ] Observer: Un message "Aucun moment" ou similaire apparait
- [ ] Retourner dans "Profil"
- [ ] Verifier que d'autres parametres sont toujours sauvegardes

### Test de Gestion d'Erreur
- [ ] (Test manuel difficile, verifier dans le code)
- [ ] Le try/catch est present
- [ ] Une alerte d'erreur apparait en cas d'echec

### Resultat
- [ ] PASSE
- [ ] ECHOUE (details: _______________)

---

## FONCTIONNALITE 4: AUTHENTIFICATION RETIREE

### Test au Lancement
- [ ] Fermer completement l'application
- [ ] Relancer l'application
- [ ] Observer: Aucun ecran de login n'apparait
- [ ] Observer: L'application demarre directement sur l'onglet principal

### Test de Navigation
- [ ] Naviguer dans tous les onglets
- [ ] Observer: Aucun ecran ne demande de se connecter
- [ ] Observer: Aucun bouton "Se connecter" ou "S'inscrire"
- [ ] Observer: Toutes les fonctionnalites sont accessibles

### Test des Parametres
- [ ] Aller dans l'onglet "Profil"
- [ ] Scroller dans toutes les sections
- [ ] Observer: Aucune section "Compte" ou "Connexion"
- [ ] Observer: Aucun bouton "Deconnexion"

### Resultat
- [ ] PASSE
- [ ] ECHOUE (details: _______________)

---

## TESTS DE REGRESSION

### Test de Lecture des Moments
- [ ] Appuyer sur le bouton play d'un moment
- [ ] Observer: Le lecteur s'ouvre
- [ ] Observer: La video se charge
- [ ] Observer: La lecture demarre au bon timestamp

### Test de Capture de Moment
- [ ] Ouvrir une video
- [ ] Appuyer sur le bouton de capture
- [ ] Observer: Un nouveau moment est cree
- [ ] Observer: Le moment apparait dans la liste

### Test de Navigation
- [ ] Naviguer entre tous les onglets
- [ ] Observer: Aucun crash
- [ ] Observer: Les donnees sont preservees

### Resultat
- [ ] PASSE
- [ ] ECHOUE (details: _______________)

---

## TESTS DE PERFORMANCE

### Test d'Animation
- [ ] Tester le swipe sur plusieurs moments
- [ ] Observer: Les animations sont fluides (60 fps)
- [ ] Observer: Pas de lag ou de saccade

### Test de Reactivite
- [ ] Appuyer rapidement sur plusieurs boutons
- [ ] Observer: L'application reste reactive
- [ ] Observer: Pas de freeze

### Resultat
- [ ] PASSE
- [ ] ECHOUE (details: _______________)

---

## TESTS D'ACCESSIBILITE

### Test VoiceOver (iOS) ou TalkBack (Android)
- [ ] Activer le lecteur d'ecran
- [ ] Naviguer dans l'ecran "Moments"
- [ ] Observer: Les labels sont lus correctement
- [ ] Observer: Les hints sont informatifs
- [ ] Exemple: "Lire le moment a 1:23, maintenez pour editer, balayez pour supprimer"

### Resultat
- [ ] PASSE
- [ ] ECHOUE (details: _______________)

---

## RESUME DES TESTS

### Fonctionnalites
- [ ] Swipe-to-Delete: PASSE / ECHOUE
- [ ] Edition du Titre: PASSE / ECHOUE
- [ ] Page Parametres: PASSE / ECHOUE
- [ ] Auth Retiree: PASSE / ECHOUE

### Regression
- [ ] Tests de regression: PASSE / ECHOUE

### Performance
- [ ] Tests de performance: PASSE / ECHOUE

### Accessibilite
- [ ] Tests d'accessibilite: PASSE / ECHOUE

---

## STATUT GLOBAL

- [ ] TOUS LES TESTS PASSES - PRET POUR PRODUCTION
- [ ] QUELQUES TESTS ECHOUES - CORRECTIONS REQUISES
- [ ] NOMBREUX TESTS ECHOUES - REVISION MAJEURE REQUISE

---

## NOTES ADDITIONNELLES

Date du test: __________
Testeur: __________
Appareil: __________
OS Version: __________
Version de l'app: __________

Commentaires:
_________________________________
_________________________________
_________________________________
