# Sport TV

Lecteur de séances du matin, en HTML/CSS/JavaScript, sans dépendance et sans compte utilisateur. Première version à tester sur ordinateur avant la connexion à la télévision.

## Démarrer

Depuis ce dossier : `python3 -m http.server 8080`. Ouvrir `http://localhost:8080` dans le navigateur. Ne pas ouvrir index.html directement : le programme est chargé par HTTP.

Choisir un jour, 20/25/30 minutes, la forme, l'état du genou et une éventuelle course dans les dernières 24 heures. La durée inclut 4 minutes d'échauffement et 3 minutes de retour au calme. Chaque minute centrale contient préparation, effort et récupération. Les répétitions sont une cible facultative : arrêter le mouvement avant la fin du créneau si la technique se dégrade. Les haltères ne sont pas obligatoires sur chaque exercice.

Commandes : pause/reprendre, passer, variante facile, arrêter, plein écran. Les sons sont activés au clic de démarrage si le navigateur le permet. Après une interruption de plus de 5 secondes, la lecture se met en pause plutôt que de sauter des exercices.

## Réglages par l'adresse

Le lecteur peut s'ouvrir déjà réglé, avec des paramètres dans l'adresse :

`https://tibtibus.github.io/sport-tv/?jour=vendredi&duree=25&forme=bonne&genou=ok&course=non`

| Paramètre | Valeurs acceptées |
|---|---|
| `jour` | lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche (majuscules et accents ignorés) |
| `duree` | 20, 25 ou 30 |
| `forme` | bonne, moyenne, fatigue |
| `genou` | ok, gene, douleur |
| `course` | oui, non |

- Un paramètre absent garde la valeur par défaut (le jour courant pour `jour`). Les réglages d'une séance précédente ne sont pas repris : ils viennent de l'adresse ou des valeurs par défaut.
- Les règles de sécurité sont inchangées : genou « douleur » bloque le démarrage, gêne ou fatigue donnent la séance douce, une course récente donne la séance haut du corps.
- Une valeur non reconnue affiche une erreur et bloque le démarrage jusqu'à correction.
- La ligne « Réglages reçus par l'adresse » affiche à l'écran les réglages réellement appliqués, pour les vérifier.
- Le clic sur « Commencer » reste nécessaire : le navigateur n'autorise le son qu'après un geste.

## Travail avec Hermès

Lire AGENTS.md et HERMES.md. Hermès modifie `data/program.json` pour préparer les séances ; le lecteur charge ce fichier à son ouverture. Les bilans se téléchargent en JSON et doivent être transmis à Hermès. Le lecteur ne synchronise pas automatiquement les bilans et n'exécute pas de tâche planifiée.

## Vérifier

`node scripts/check.mjs` : validité du programme, durée exacte, adaptations, gestion du repos/douleur et lecture des réglages par l'adresse.

## Suite prévue

- Illustrations et démonstrations dont la technique et les droits d'utilisation sont vérifiés.
- Commande synchronisée depuis le téléphone (nécessite un service partagé).
- Lancement sur la TCL après identification du modèle.
- Planification matinale sur l'ordinateur d'Hermès et publication selon l'hébergement choisi.

Ces fonctions ne sont pas présentes dans cette première version. Un dépôt privé ne rend pas automatiquement un site publié privé. Ne pas publier les bilans ni des renseignements médicaux.

## Démonstrations des gestes

Cinq mouvements disposent d'une vidéo : squat, pompes au mur, tirage avec haltère, hanches en arrière, pont de hanches. Avant la séance, les boutons « Voir » ouvrent un aperçu. Pendant la préparation et l'exercice, une vidéo muette accompagne le minuteur et deux consignes en français. « Observer le geste — pause » suspend le minuteur et laisse la vidéo jouer ; « Reprendre » relance la séance. Les durées de base restent inchangées ; le temps d'observation s'ajoute seulement si l'utilisateur le demande.

La vidéo est intégrée avec le lecteur officiel YouTube, sans téléchargement, extraction de séquence ou copie dans le dépôt. Les tutoriels complets sont conservés et certains sont en anglais. Ils ne sont pas tous de courtes boucles de répétitions : la boucle porte sur la vidéo originale entière. Les commandes restent accessibles et la vidéo est muette par défaut. Des annonces, restrictions ou blocages YouTube restent possibles. Les liens de source et les consignes restent disponibles si la vidéo ne charge pas. Une disponibilité réelle dans le Chrome d'Hermès et en Cast doit être vérifiée.

La variante facile affiche ses consignes et retire la vidéo de référence pour ne pas montrer un geste différent. Les autres mouvements gardent leurs consignes textuelles. La démonstration ne corrige pas la posture de l'utilisateur.

Le tirage est maintenant explicité avec appui sur un support fixe et stable, pour correspondre au tutoriel. Les autres exercices, l'ordre, les durées, les réglages par adresse et les identifiants des commandes d'Hermès sont conservés.

### Sources des vidéos

- Squat et pont à deux jambes : [Kingston and Richmond NHS, physiothérapie](https://www.kingstonandrichmond.nhs.uk/services/service-search-z/physiotherapy-msk-richmond), vidéos liées directement par le service.
- Pompes au mur : [South Tees Hospitals NHS](https://www.southtees.nhs.uk/resources/combined-press-ups/), vidéo liée par le service.
- Tirage avec haltère : [Michelle Kenway, physiothérapeute](https://www.pelvicexercises.com.au/dumbbell-row/), lecteur et lien de la publication de l'auteure.
- Hanches en arrière : [Hinge Health](https://www.hingehealth.com/fr/fr/resources/articles/hip-hinge/), vidéo du compte Hinge Health et guide relu par un physiothérapeute.

Sélection des sources : 3 octobre 2026. Le catalogue est data/demos.json ; ne pas y ajouter des vidéos dont la variante ne correspond pas à l'exercice. Ne pas remplacer les vidéos par des gestes générés par IA. Les auteurs conservent leurs droits : aucune autorisation de réhéberger ces fichiers n'est supposée.
