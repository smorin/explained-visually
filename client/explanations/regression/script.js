'use strict'

var color = {
    primary: '#e74c3c'
  , secondary: '#2ecc71'
  , tertiary: '#3498db'
  , quaternary: '#f1c40f'
  , quinary: '#2c3e50'
  , senary: '#9b59b6'
  , eigen: '#cbcbcb'
  , difference: '#cbcbcb'
  , shy: 'rgba(0, 0, 0, 0.2)'
}

function tickStyle(g) {
  g.style({
    'stroke-width': 1,
    stroke: 'rgba(0, 0, 0, 0.1)',
    'shape-rendering': 'crispEdges'
  })
}

function pointStyle(g) {
  g.attr('r', 4)
    .style('stroke', 'none')
    .style('fill', color.senary)
}

function axisStyle(g) {
  g.style('shape-rendering', 'crispEdges')
   .style('font-size', '12px')
  g.selectAll('path')
    .style('fill', 'none')
    .style('stroke', 'black')
  g.selectAll('line')
    .style('fill', 'none')
    .style('stroke', 'black')
}

function axisFontStyle(g) {
  g.selectAll('text')
   .style('fill', 'black')
   .style('stroke', 'none')
}

function plotTitleStyle(g) {
  g.style('fill', 'black')
  .style('stroke', 'none')
  .style('text-anchor', 'middle')
  .style('font-weight', 'bold')
}

function updateTicks(g, axis, x, y, ticks) {
  var ent = g.selectAll('line').data(ticks)
  ent.exit().remove()
  ent.enter().append('line')
  ent
    .attr('x1', axis === 'x' ? x            : x.range()[0])
    .attr('y1', axis === 'x' ? y.range()[0] : y           )
    .attr('x2', axis === 'x' ? x            : x.range()[1])
    .attr('y2', axis === 'x' ? y.range()[1] : y           )
    .call(tickStyle)
}

function buildNobs(coord, data, className) {
  var nobs = coord.append('g').attr('class', className)
    .selectAll('.nob').data(data || []).enter()
      .append('g').attr('class', 'nob')
  var circle = nobs.append('circle').attr('r', 20)
  function loop(g) {
    g
      .transition()
      .duration(1000)
      .ease('ease-out')
      .attr({r: 25})
      .style({fill: 'rgba(0, 0, 0, 0.2)'})
      .transition()
      .ease('ease-in')
      .duration(1000)
      .attr({r: 20})
      .style({fill: 'rgba(0, 0, 0, 0.1)'})
      .each('end', function() { return loop(d3.select(this)) })
  }
  circle.call(loop).on('mousedown', function() {
    d3.selectAll('.nob').select('circle')
      .transition()
      .each('end', null)
      .transition()
      .duration(1000)
      .ease('ease-out')
      .attr({r: 20})
      .style({fill: 'rgba(0, 0, 0, 0.1)'})
  })
  return nobs
}

var LeastSquares = React.createClass({
  sel: function() { return d3.select(this.getDOMNode()) },
  getDefaultProps: function() {
    return {
      pointAccessor: function(d) { return d.point },
      mode: 'points',
    }
  },
  getInitialState: function() {
    var w = 410, h = 410
    var m = {l: 30, t: 20, r: 20, b: 30}
    var x = d3.scale.linear().domain([0, 100]).range([m.l, w - m.r])
    var y = d3.scale.linear().domain([0, 100]).range([h - m.b, m.t])
    function xy(d) { return [x(d[0]), y(d[1])] }
    function xyi(d) { return [x.invert(d[0]), y.invert(d[1])] }
    var initState =  {
      w: w,
      h: h,
      m: m,
      x: x,
      y: y,
      xy: xy,
      xyi: xyi,
      svgPadding: 50
    }
    return this._updateStateFromProps(this.props, initState)
  },
  // Life cycle events.
  componentDidMount: function() {
    var self = this
    var state = this.state
    var colorScale = d3.scale.category10()
    var el = this.sel()

    var svg = this.sel().append('svg').attr({
      width: state.w + state.svgPadding * 2,
      height: state.h + state.svgPadding * 2
    }).style({
      position: 'absolute',
      left: -state.svgPadding + 'px',
      top: -state.svgPadding + 'px',
      'pointer-events': 'none'
    })

    var defs = svg.append('defs')
    
    var gradient1 = defs.append('linearGradient')
        .attr({
          id: 'bg-gradient-0',
          gradientUnits: 'objectBoundingBox',
          x2: 1, y2: 0
        })
    var fade = 0.1
    gradient1.append('stop')
      .attr('stop-color', 'white').attr('stop-opacity', 0).attr('offset', 0)
    gradient1.append('stop')
      .attr('stop-color', 'white').attr('stop-opacity', 1).attr('offset', fade)
    gradient1.append('stop')
      .attr('stop-color', 'white').attr('stop-opacity', 1).attr('offset', 1 - fade)
    gradient1.append('stop')
      .attr('stop-color', 'white').attr('stop-opacity', 0).attr('offset', 1)

    var gradient2 = defs.append('linearGradient')
        .attr({
          id: 'bg-gradient-1',
          gradientUnits: 'objectBoundingBox',
          x2: 0, y2: 1
        })
    gradient2.append('stop')
      .attr('stop-color', 'white').attr('stop-opacity', 0).attr('offset', 0)
    gradient2.append('stop')
      .attr('stop-color', 'white').attr('stop-opacity', 1).attr('offset', fade)
    gradient2.append('stop')
      .attr('stop-color', 'white').attr('stop-opacity', 1).attr('offset', 1 - fade)
    gradient2.append('stop')
      .attr('stop-color', 'white').attr('stop-opacity', 0).attr('offset', 1)

    var mask0 = defs.append('mask').attr('id', 'bg-mask-0')
    
    mask0.append('rect')
      .attr({
        width: state.w + state.svgPadding * 2,
        height: state.h + state.svgPadding * 2,
        fill: 'url(#bg-gradient-0)'
      })

    var mask1 = defs.append('mask').attr('id', 'bg-mask-1')

    mask1.append('rect').attr({
        width: state.w + state.svgPadding * 2,
        height: state.h + state.svgPadding * 2,
        fill: 'url(#bg-gradient-1)'
      })

    var bg0 = svg.append('g').attr('mask', 'url(#bg-mask-0)')
    var bg1 = bg0.append('g').attr('mask', 'url(#bg-mask-1)')

    var stage = bg1.append('g')
      .attr('class', 'stage')
      .attr('transform', 'translate(' + [state.svgPadding, state.svgPadding] + ')')

    stage.append('g').call(d3.svg.axis().scale(state.x))
      .call(axisStyle)
      .attr('transform', 'translate(' + [0, state.y.range()[0]] + ')')

    stage.append('g').call(d3.svg.axis().scale(state.y).orient('left'))
      .call(axisStyle)
      .attr('transform', 'translate(' + [state.x.range()[0], 0] + ')')
    
    stage.append('g').call(updateTicks, 'x', state.x, state.y, state.x.ticks())
      .attr('class', 'x-ticks')
    stage.append('g').call(updateTicks, 'y', state.x, state.y, state.y.ticks())
      .attr('class', 'y-ticks')

    // Add trend line.
    stage.append('line').attr('class', 'line-ols')
      .style('stroke', color.primary)

    // Add error lines.
    stage.append('g').attr('class', 'error-lines')
      .selectAll('line').data(this.state.errors).enter().append('line')
      .style('stroke', function(d, i) { return alphaify(colorScale(i), 1) })
      .style('stroke-width', 2)
      .style('stroke-dasharray', '2, 2')

    stage.append('g').attr('class', 'error-squares')
      .selectAll('rect').data(this.state.errors).enter().append('rect')
      .style('fill', function(d, i) { return alphaify(colorScale(i), 0.2) })
      .style('pointer-events', 'none')


    // Add nobs.
    if (this.props.mode === 'point')
      buildNobs(stage, this.props.points, 'point-nobs')
        .call(d3.behavior.drag()
          .on('drag', function(d, i) {
            var p = state.xyi(d3.mouse(stage.node()))
            p[0] = d3.round(p[0], 2), p[1] = d3.round(p[1], 2)
            self._clamp(p)
            self.props.onDragNob('point', { pos: p, d: d, i: i })
          })
        ).style('pointer-events', 'auto')

    if (this.props.mode === 'regression')
      buildNobs(stage, this.props.regressionPoints, 'regression-nobs')
        .call(d3.behavior.drag()
          .on('drag', function(d, i) {
            var p = state.xyi(d3.mouse(stage.node()))
            p[0] = d3.round(p[0], 2), p[1] = d3.round(p[1], 2)
            self._clamp(p)
            self.props.onDragNob('regression', { pos: p, d: d, i: i })
          })
        ).style('pointer-events', 'auto')

    // Add points.
    stage.append('g').attr('class', 'points')
      .selectAll('g')
      .data(this.props.points)
      .enter().append('g').append('circle')
        .attr({r: 4})
        .style('fill', function(d, i) { return alphaify(colorScale(i), 1) })
        .style('pointer-events', 'none')


    this._updateDOM()
  },
  componentWillReceiveProps: function(newProps) {
    // Simple dirty checking. Requires copy to force redraw.
    if (   newProps.points === this.props.points
        && newProps.regressionPoints === this.props.regressionPoints
    ) return
    // Won't trigger re-render.
    this.setState(this._updateStateFromProps(newProps))
    this._updateDOM()
  },
  _clamp: function(p) {
    var x = this.state.x, y = this.state.y
    p[0] = Math.max(x.domain()[0], Math.min(x.domain()[1], p[0]))
    p[1] = Math.max(y.domain()[0], Math.min(y.domain()[1], p[1]))
    return p
  },
  // Private methods.
  _updatePoints: function() {
    var state = this.state
    this.sel().select('.points').selectAll('g')
      .data(this.props.points)
      .attr({
        transform: function(d) {
          return 'translate(' + state.xy(acc('point')(d)) + ')'
        }
      })
  },
  _updateTrendLine: function() {
    var x = this.state.x, y = this.state.y
    var reg = this.state.reg, rs = this.state.rs

    var p1 = [x.domain()[0], rs(x.domain()[0])]
    var p2 = [x.domain()[1], rs(x.domain()[1])]

    // Restrict the line to the plot area.
    if (p1[1] < y.domain()[0])
      p1 = [rs.invert(y.domain()[0]), y.domain()[0]]
    else if (p1[1] > y.domain()[1])
      p1 = [rs.invert(y.domain()[1]), y.domain()[1]]

    if (p2[1] < y.domain()[0])
      p2 = [rs.invert(y.domain()[0]), y.domain()[0]]
    else if (p2[1] > y.domain()[1])
      p2 = [rs.invert(y.domain()[1]), y.domain()[1]]

    this.sel().select('.line-ols')
      .attr({ x1: x(p1[0]), y1: y(p1[1]), x2: x(p2[0]), y2: y(p2[1]) })
  },
  _updateNobs: function() {
    var state = this.state, props = this.props
    this.sel().select('.point-nobs').selectAll('.nob')
      .data(this.props.points)
      .attr('transform', function(d) {
        return 'translate(' + state.xy(props.pointAccessor(d)) + ')'
      })
    if (this.props.regressionPoints)
      this.sel().select('.regression-nobs').selectAll('.nob')
        .data(this.props.regressionPoints)
        .attr('transform', function(d) {
          return 'translate(' + state.xy(d) + ')'
        })
  },
  _updateErrors: function() {
    var state = this.state, errors = state.errors
    var acc = this.props.pointAccessor
    this.sel().select('.error-lines').selectAll('line')
      .data(errors)
      .attr({
        x1: function(d) { return state.x(acc(d.d)[0]) },
        x2: function(d) { return state.x(acc(d.d)[0]) },
        y1: function(d) { return state.y(acc(d.d)[1]) },
        y2: function(d) { return state.y(acc(d.d)[1] + d.err) },
      })
    this.sel().select('.error-squares').selectAll('rect')
      .data(errors)
      .attr('transform', function(d) {
        return 'translate(' + state.xy(acc(d.d)) + ')'
      })
      .attr({
        x: function(d) {
          if (state.reg.b > 0 && d.err < 0)
            return state.x(acc(d.d)[1] + d.err) - state.x(acc(d.d)[1])
          if (state.reg.b < 0 && d.err > 0)
            return - state.x(acc(d.d)[1] + d.err) + state.x(acc(d.d)[1])
        },
        y: function(d) {
          if (d.err < 0) return 0
          return state.y(acc(d.d)[1] + d.err) - state.y(acc(d.d)[1])
        },
        width: function(d) {
          return Math.abs(state.x(acc(d.d)[1] + d.err) - state.x(acc(d.d)[1]))
        },
        height: function(d) {
          return Math.abs(state.y(acc(d.d)[1] + d.err) - state.y(acc(d.d)[1]))
        }
      })
  },
  _updateStateFromProps: function(props, state) {
    state = state || this.state
    var x = state.x, y = state.y
    var reg
    if (props.mode === 'point') {
       reg = ols(props.points, this.props.pointAccessor)
    } else {
      reg = (function() {
        var x1 = props.regressionPoints[0][0], y1 = props.regressionPoints[0][1]
        var x2 = props.regressionPoints[1][0], y2 = props.regressionPoints[1][1]
        var dy = y2 - y1, dx = x2 - x1
        if (Math.abs(dx) < 1e-6) dx = 1
        var b = dy / dx, a = - b * x1 + y1
        return { a: a, b: b}
      })()
    }
    var rs = d3.scale.linear().domain([0, 1]).range([reg.a, reg.a + reg.b * 1])
    state.errors = props.points.map(function(d) {
      return { err: rs(d.point[0]) - d.point[1] /* err = x - X */, d: d }
    })
    state.reg = reg
    state.rs = rs
    return state
  },
  _updateDOM: function() {
    this._updateTrendLine()
    this._updatePoints()
    this._updateNobs()
    this._updateErrors()
  },
  render: function() {
    var style = extend({
      width: this.state.w + 'px',
      height: this.state.h + 'px',
      position: 'relative'
    }, this.props.style || {})
    return React.DOM.div({style: style})
  }
})

var TreeMap = React.createClass({
  sel: function() { return d3.select(this.getDOMNode()) },
  getDefaultProps: function() {
    return {
      valueAccessor: function(d) { return d.value },
      colorAccessor: function(d) { return d.color },
      width: 400,
      height: 400,
      maxArea: 1000
    }
  },
  getInitialState: function() {
    var props = this.props
    return {
      treemapLayout: d3.layout.treemap().sort(null)
    }
  },
  render: function() {
    var props = this.props, data = props.data
    var style = extend({ backgroundColor: 'rgba(0, 0, 0, 0.1)' }, props.style || {})
    delete props.style
    delete props.data
    
    var wrappedData = data.map(function(d) {
      return { value: props.valueAccessor(d), d: d }
    })
    // var area = wrappedData.reduce(function(c, d) { return d.value }, 0) * 2000
    var nodes = this.state.treemapLayout
      .size([props.height, props.width])
      .nodes({ children: wrappedData })
      .filter(function(d) { return d.parent })
      .map(function(d) { delete d.parent; return d }) // Printable as JSON.

    var nodeRects = nodes.map(function(d, i) {
      return React.DOM.rect({
        x: d.x,
        y: d.y,
        width: d.dx,
        height: d.dy,
        key: i,
        fill: props.colorAccessor(d.d.d),
        stroke: 'rgba(255, 255, 255, 0.2)'
      })
    })

    return React.DOM.svg(extend({style: style}, props), nodeRects)
  }
})

var OLS3D = React.createClass({
  sel: function() { return d3.select(this.getDOMNode()) },
  getDefaultProps: function() {
    return {
      valueAccessor: function(d) { return d.value },
      width: 400, height: 400
    }
  },
  getInitialState: function() {
    var props = this.props
    return {}
  },
  render: function() {
    var props = this.props, data = props.data
    var style = extend({
      width: props.width,
      height: props.height,
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    }, this.props.style || {})
    return React.DOM.div(extend({style: style}, props), null)
  }
})

var StackedBars = React.createClass({
  sel: function() { return d3.select(this.getDOMNode()) },
  getDefaultProps: function() {
    return {
      valueAccessor: function(d) { return d.value },
      domain: function(d) { return [0, 1] },
      colorAccessor: function(d) { return d.color },
      width: 400,
      height: 400
    }
  },
  render: function() {
    var props = this.props, data = props.data
    var style = extend({ backgroundColor: 'rgba(0, 0, 0, 0.1)' }, props.style || {})
    delete props.style
    delete props.data
    
    var scale = d3.scale.linear().domain(props.domain).range([0, props.width])

    var wrappedData = data.map(function(d) {
      return { value: props.valueAccessor(d), d: d }
    })
    var total = wrappedData.reduce(function(c, d) { return c + d.value}, 0)
    var curX = 0
    wrappedData.forEach(function(d) {
      d.dx = scale(d.value), d.x = curX, curX += d.dx
    })

    var nodeRects = wrappedData.map(function(d, i) {
      return React.DOM.rect({
        x: d.x,
        y: 0,
        width: d.dx,
        height: props.height,
        key: i,
        fill: props.colorAccessor(d.d),
        stroke: 'rgba(255, 255, 255, 0.2)'
      })
    })

    return React.DOM.svg(extend({style: style}, props), nodeRects)
  }
})

// Ordinary Least Squares
function ols(points_, pointAccessor) {
  var points = points_.map(pointAccessor || function(d) { return d })
  var xmean = d3.mean(points, function(d) { return d[0] })
  var ymean = d3.mean(points, function(d) { return d[1] })
  var bNum = points
    .reduce(function(c, d) { return (d[0] - xmean) * (d[1] - ymean) + c }, 0)
  var bDenom = points
    .reduce(function(c, d) { return c + Math.pow(d[0] - xmean, 2) }, 0)
  var b = bNum / bDenom
  var a = ymean - b * xmean
  return {a: a, b: b}
}

// Sum of squared residuals using positive-definite Hessian.
function hessian(y, X_) {
  var i, j, n = X_.length, p = X_[0].length + 1, X = []
  for(i = 0; i < n; i++) X[i] = [1].concat(X_[i])
  var X_T = numeric.transpose(X)
  return numeric.dot(numeric.dot(numeric.inv(numeric.dot(X_T, X)), X_T), y)
}

function copyArray(a) {
  var b = []
  for(var i = 0; i < a.length; i++) b.push(a[i])
  return b
}

var App = React.createClass({
  getInitialState: function() {
    var color = d3.scale.category10()
    var leastSquaresPoints = [
      [16,  5],
      [13, 23],
      [24, 33],
      [43, 32],
      [51, 53],
      [84, 65],
      [90, 85]
    ].map(function(point, i) { return { point: point, color: color(i) } })
    var state = {
      leastSquaresPoints: leastSquaresPoints,
      regressionPoints: [ [20, 20], [80, 80] ],
      // Dependent state / possible pre-mature optimization.
      leastSquaresErrors: this._leastSquaresErrors(leastSquaresPoints)
    }
    return state
  },
  _pointAccessor: function(d) { return d.point },
  _onDragOLSNob: function(type, e) {
    if (type === 'point') {
      var points = copyArray(this.state.leastSquaresPoints)
      points[e.i].point = e.pos
      this.setState({
        leastSquaresPoints: points,
        leastSquaresErrors: this._leastSquaresErrors(points)
      })
    }
  },
  _onDragRegressionNob: function(type, e) {
    if (type === 'regression') {
      var points = copyArray(this.state.regressionPoints)
      points[e.i] = e.pos
      this.setState({ regressionPoints: points })
    }
  },
  _leastSquaresErrors: function(points) {
    var acc = this._pointAccessor, reg = ols(points, acc)
    var rs = d3.scale.linear().domain([0, 1]).range([reg.a, reg.a + reg.b * 1])
    return points.map(function(d) {
      var point = acc(d)
      var value = Math.abs(rs(point[0]) - point[1]) /* err = x - X */
      return { value: value * value, d: d }
    })
  },
  render: function() {
    return React.DOM.div(null, [
      LeastSquares({
        points: this.state.leastSquaresPoints,
        pointAccessor: this._pointAccessor,
        onDragNob: this._onDragOLSNob,
        mode: 'point',
        key: 'least-squares',
        style: {float: 'left'}
      }),
      StackedBars({
        width: 1000,
        height: 10,
        domain: [0, 20000],
        data: this.state.leastSquaresErrors,
        key: 'least-squares-stacked-bar',
        colorAccessor: function(d) { return d.d.color }
      }),
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      LeastSquares({
        points: this.state.leastSquaresPoints,
        pointAccessor: this._pointAccessor,
        onDragNob: this._onDragRegressionNob,
        mode: 'regression',
        regressionPoints: this.state.regressionPoints,
        key: 'regression-2',
        style: {float: 'left'}
      }),
      React.DOM.div({style: { clear: 'both' } }),
      OLS3D()
    ])
  }
})

React.renderComponent(App(), d3.select('.myApp').node())
