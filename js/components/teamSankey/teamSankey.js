;(function(window, undefined){

    'use strict'


    var init = function(el){

      var svg
      var defs
      var ids = ['#first', '#second', '#third', '#fourth']
      var w
      var h

    	d3.xml('../js/components/teamSankey/teamSankey.svg', function(xml){

    		var node = d3.select(el).node()
        $(node).append(xml.documentElement);

        svg = d3.select(el).select('svg')

        var vb = svg.attr('viewBox').split(' ')
        w = vb[2]
        h = vb[3]

        defs = svg.append('defs')

        ids.forEach(function(d, i){
          svg.select(d)
            .attr('opacity', 0)
        })

        svg.selectAll('#lines > g').each(function(e, i){
          createClippingMask(i)
          d3.select(this)
            .attr('id', 'ln_' + i)
            .attr('clip-path', 'url(#linem'+i+')')
        })

      })

      function createClippingMask(id){
        defs.append('clipPath')
          .attr('id', 'linem' + id)
          .append('rect')
          .attr('width', 0)
          .attr('height', h)

      }

      this.animate = function() {

        ids.forEach(function(d, i){

          svg.select(d)
            .attr('opacity', 0)
            .transition()
            .duration(1000)
            .delay(500 + 250*i)
            .attr('opacity', 1)

        })

        var leng = svg.selectAll('#lines > g').length

        defs.selectAll('clipPath rect')
          .attr('width', 0)
          .transition()
          .duration(1200)
          .delay(function(d, i){
            return 2500 + 200*(leng-i)
          })
          .attr('width', w)

      }

      return this;
    }





        // global interface name
    window.teamSankey = init

})(window);
