# Préparer les séances

1. Cloner TibTIBUS/sport-tv avec ton propre accès, puis lire README.md et AGENTS.md.
2. Récupérer main et les branches ouvertes. Si la première version est dans une PR, travailler à partir de sa branche ; ne pas créer une version parallèle du lecteur.
3. Lire les bilans et les courses transmis par l'utilisateur. Les fichiers téléchargés ne sont pas synchronisés : demander leur emplacement si inconnu. Conserver les informations sensibles hors du dépôt.
4. Modifier data/program.json sur une branche dédiée. Les champs d'un exercice sont name, cue, easy et target. Chaque jour référence des identifiants d'exercices existants. Les variantes gentle et afterRun doivent rester renseignées.
5. Conserver une progression stable, pas un programme aléatoire quotidien. Démarrer avec le programme de référence puis ajuster selon le ressenti réellement transmis.
6. Lancer node scripts/check.mjs et vérifier une séance dans le navigateur.
7. Commit/push sans force et proposer la modification. Vérifier les modifications concurrentes avant intégration.

## Lancer une séance par l'adresse

Ouvrir le lecteur avec les réglages du jour dans l'adresse, par exemple `?jour=vendredi&duree=25&forme=bonne&genou=ok&course=non`, plutôt que de remplir le formulaire par clics (voir README.md, « Réglages par l'adresse »). Les valeurs viennent des réponses données le jour même, jamais de la veille. Vérifier à l'écran la ligne « Réglages reçus par l'adresse » avant de cliquer une seule fois sur « Commencer ». Si le bouton reste bloqué (douleur au genou, valeur non reconnue, jour de repos), ne pas forcer : l'expliquer à l'utilisateur.

## Servir le lecteur à domicile

Lancer un serveur HTTP dans le dossier du projet, accessible depuis le réseau domestique si nécessaire. Le serveur Python du README est uniquement un serveur de développement ; ne pas exposer son port sur Internet. Aucun allumage ni lancement TV n'est configuré.

## Planification à décider

Confirmer l'heure souhaitée et le fuseau Europe/Paris, la destination du lecteur et le mécanisme de publication avant d'installer une tâche récurrente. Une mise à jour Git ne met pas automatiquement à jour une page déjà ouverte : recharger le lecteur après une mise à jour, en dehors d'une séance.
