# Plotly
  
Documentation complète sur [Plot.ly/javascript](https://plot.ly/javascript)

## Créer un graph

```js
/**
* @param {HTMLElement|string} element - Le conteneur du graph, ou sa propriété "id"
* @example Avec un DOMElement
*   const element = document.getElementById("monElement")
* @example Avec un id
*   const element = "monElement"
* @param {Object[]} traces - Les options par plot dans le graph 
* @param {Object} layout - Configure la disposition du plot
* @param {Object} options - Options gnérales de contrôle du plot
*/

const plot = Plotly.react("monElement" [{
    x: [1,2,3],  // Peut ête des objets Date() 
    y: [11, 22, 33],
    mode: "line", // Peut être "lines", "markers", "lines+markers"
    type: "scattergl", // Le type de contexte, ici webGL sera utilisé tout le temps
    name: "température", // Le nom de la trace affichée dans la légende
    line: { color: "#500" },
}], {
    showllegend: true,
    xaxis: { rangeSlider: true, }, // Le slider affiché sous le graph pour rerpère. Note: n'est pas compatible avec le contexte "scattergl" dans la version 1.48.3 de Plotly
    yaxis: { fixedrange: true, }, // Bloque le redimentionnement sur l'axe des Y
    width: 700, // en pixel
    height: 500, // en pixel
}, {
    displayModeBar: false, // Désactive l'affichage d'une barre de contrôles pour chaque graph
    scrollZomm: true, // Active le zoom à la molette de la souris
    responsive: true, // Adapte les dimentions du graph à la taille de la fenêtre. Note: Je n'ai pas exactement compris sur quel elements il appliquait le resimentionnement 
})

```

## Performences
|                      | 300 points | 86400 points |
| -------------------- | ---------- | ------------ |
| **webGL + plotting** | 1800ms     | 2100ms       |
| **plotting**         | 100ms      | 800ms        |
| **Différence**       | 1100ms     | 1300ms       |
    
Le contexte webGL est créé lorsque le premier graph est affiché

Une fois qu'il est créé, il faut ré-utiliser ce contexte afin de de gagner du temps (~ 1s mesurée)

Pour cela il faut utiliser la méthode `Plotly.react()` plutot que `Plotly.plot()` ou `Plotly.newPlot()` afin de conserver le contexte d'affichage.

## Différents type de plots

Les trois types d'affichage sont équivalents en terme de performences

- Uniquement des points
    - Affiche un ensemble de points sans les relier entre eux
    - ```js 
        Plotly.react(elmnt, [{
            mode: "markers"
        }])
        ```
- Uniquement des lignes
    - Trace des lignes entre les points du graph, mais n'affiche pas de points 
    - ```js 
        Plotly.react(elmnt, [{
            mode: "lines"
        }])
        ```
- Points et lignes
    - Affiche les lignes et les points sur le graph
    - ```js 
        Plotly.react(elmnt, [{
            mode: "lines+markers"
        }])
        ```