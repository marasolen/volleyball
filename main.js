let data;

const setupVisualization = () => {
    const containerWidth = document.getElementById("visualization").clientWidth;
    const containerHeight = document.getElementById("visualization").clientHeight;

    const margin = {
        top: 0.02 * containerHeight,
        right: 0.06 * containerWidth,
        bottom: 0 * containerHeight,
        left: 0.06 * containerWidth
    };

    const width = containerWidth - (margin.right + margin.left);
    const height = containerWidth - (margin.top + margin.bottom);

    const xScale = d3.scaleLinear()
        .domain([-4, 4])
        .range([0, width]);
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.calPerMin)])
        .range([height, 0]);    
    
    const svg = d3.select("#visualization");
    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    chart.selectAll(".ball")
        .data(data)
        .join("circle")
        .attr("r", width / 100)
        .attr("cx", d => xScale(d.winLossDiff))
        .attr("cy", d => yScale(d.calPerMin))
        .attr("date", d => d.date)
        .attr("fill");
};

const renderVisualization = () => {
    setupVisualization();
};

const resizeAndRender = () => {
    d3.selectAll("svg > *").remove();

    d3.selectAll("#visualization")
        .attr("width", "100%");

    renderVisualization();

    d3.selectAll("text")
        .attr("font-size", function() { return d3.select(this).attr("text-multiplier") * 0.03 * document.getElementById("visualization").clientHeight });
};

window.onresize = resizeAndRender;

Promise.all([d3.csv('data/data.csv')]).then(([_data]) => {
    data = _data;
    data.forEach(d => {
        console.log((+d.hours * 60) + +d.minutes)
        d.calPerMin = +d.caloriesburned / (+d.hours * 60 + +d.minutes);
        d.winLossDiff = +d.won - +d.lost;
    });

    resizeAndRender();
});