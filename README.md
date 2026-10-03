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
