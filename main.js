let data;

const setupVisualization = () => {
    const containerWidth = document.getElementById("visualization").clientWidth;
    const containerHeight = document.getElementById("visualization").clientHeight;

    const margin = {
        top: 0.05 * containerHeight,
        right: 0.05 * containerWidth,
        bottom: 0.1 * containerHeight,
        left: 0.1 * containerWidth
    };

    const width = containerWidth - (margin.right + margin.left);
    const height = containerHeight - (margin.top + margin.bottom);
    console.log(height)

    const xScale = d3.scaleLinear()
        .domain([-4, 4])
        .range([0.05 * width, 0.95 * width]);
    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.calPerMin))
        .range([0.95 * height, 0.05 * height]);    
    
    const svg = d3.select("#visualization");
    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const arrowSideSize = 1.5;

    svg.append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, 2 * arrowSideSize, 2 * arrowSideSize])
        .attr('refX', arrowSideSize)
        .attr('refY', arrowSideSize)
        .attr('markerWidth', 2 * arrowSideSize)
        .attr('markerHeight', 2 * arrowSideSize)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()([[0, 0], [0, 2 * arrowSideSize], [2 * arrowSideSize, arrowSideSize]]))
        .attr('stroke-width', '0')
        .attr("fill", "white");

    const colourMap = {
        "league": "#7D1D3F",
        "practice": "#FE6D73",
        "sub": "#F18F01",
        "dropin": "#4CB944"
    };

    const prng = new Math.seedrandom("my volleyball!!!!");

    const zones = [
        { start: 0, width: width },
        { start: width / 3, width: width / 3 },
        { start: 0, width: width / 2 }
    ]

    chart.selectAll(".zone")
        .data(zones)
        .join("rect")
        .attr("x", d => d.start)
        .attr("y", 0)
        .attr("width", d => d.width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", width / 100);

    chart.selectAll(".ball")
        .data(data)
        .join("circle")
        .attr("r", width / 80)
        .attr("cx", d => xScale(d.winLossDiff) + (prng.quick() - 0.5) * width / 40)
        .attr("cy", d => yScale(d.calPerMin))
        .attr("date", d => d.date)
        .attr("fill", d => colourMap[d.type])
        .attr("opacity", 0.7);

    svg.append('path')
        .attr('d', d3.line()([[2 * margin.left / 3, margin.top + height * 0.8], [2 * margin.left / 3, margin.top + height * 0.2]]))
        .attr('stroke', 'white')
        .attr("stroke-width", width / 150)
        .attr('marker-end', 'url(#arrow)')
        .attr('fill', 'none');

    svg.append('path')
        .attr('d', d3.line()([[margin.left + width * 0.2, containerHeight - 2 * margin.bottom / 3], [margin.left + width * 0.8, containerHeight - 2 * margin.bottom / 3]]))
        .attr('stroke', 'white')
        .attr("stroke-width", width / 150)
        .attr("marker-start", "url(#arrow)")
        .attr('marker-end', 'url(#arrow)')
        .attr('fill', 'none');

    svg.append("text")
        .attr("transform", `translate(${margin.left + width / 2}, ${containerHeight - margin.bottom / 4})`)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("text-multiplier", 1.3)
        .attr("fill", "white")
        .text("-   set point differential   +");

    svg.append("text")
        .attr("transform", `translate(${margin.left / 2}, ${margin.top + height / 2}) rotate(-90)`)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("text-multiplier", 1.3)
        .attr("fill", "white")
        .text("calories burned per minute");
        
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
        d.calPerMin = +d.caloriesburned / (+d.hours * 60 + +d.minutes);
        d.winLossDiff = +d.won - +d.lost;
    });

    resizeAndRender();
});