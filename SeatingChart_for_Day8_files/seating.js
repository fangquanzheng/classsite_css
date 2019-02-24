var seatViz = {};

seatViz.studentData = [];

seatViz.runOnData = function (seating,fcns)
{

    d3.json(seating, function(err,rows)
    {
     seatViz.studentData = rows;
     rows.forEach(seatViz.setPosition);
     fcns.forEach(function(fcn) { fcn();console.log("fcn called"); });
   });

}

seatViz.transformData = function(data,key,obj)
{
    data.forEach( function(o,index)
                 {
        obj[o[key]] = o;
    });
    return obj;
}

seatViz.margins={top:-100,bottom:20,left:20,right:20};
seatViz.width = 700;
seatViz.height = 600;
seatViz.setPosition = function(student)//,name,group,seat,dict)
{
    var group = Math.floor(student.day_student_seat /2);
    var seat = student.day_student_seat % 2;

    var pos = group %4; //of the group
    var right = pos >1; //right or left of asile
    var odd = group % 2; //

    var sides = seatViz.margins.left+seatViz.margins.right;
    x = seatViz.margins.left;
    if(right) { x = (seatViz.width-sides)/2+50;}
    if(odd)   { x += (seatViz.width-sides)/4;}
    if(seat>0){ x += (seatViz.width-sides)/8-10;}

    y = (1+Math.floor(group/4))*seatViz.height/5;
    student.x = x;
    student.y=y+seatViz.margins.top;
//    obj = {name:name,group:group,x:x,y:y};
//    dict[name]=obj;
}

seatViz.displayFunction= function()
{
    console.log(seatViz.seatingData);
    console.log(seatViz.classData);
    console.log(seatViz.classDataDict);
}

seatViz.drawSeatImages = function()
{
  console.log("studentData",seatViz.studentData);

    svg = d3.select("svg")
        svg.attr("width",seatViz.width)
        svg.attr("height",seatViz.height);

    svg.selectAll("image")
        .data(seatViz.studentData)
        .enter()
        .append("image")
        .attr("xlink:href",function(d) {
               return d.person_image;
        })
//        .attr("width",10)
//        .attr("height",10)
        .attr("x",seatViz.width/2)
        .attr("y",seatViz.height/2)
        .classed("seat_pic",true)
//        .transition()
//        .delay(1000)
//        .duration(2000)
//        .ease("bounce")
        .attr("width",70)
        .attr("height",96)
        .attr("x",function(d) {return d.x;})
        .attr("y",function(d) { return d.y;});
//        .attr("clip-path","url(#myClip)");


}

seatViz.setAbsences = function(day_id)
{
    return function()
    {
      console.log("setting onClicks");
      d3.selectAll("image").on("click",function(d)
       {
        if(window.confirm("Mark "+
          (d.person_prefered_name?d.person_prefered_name:d.person_first_name) +
           " " + d.person_last_name+" absent?"))
           {
              //now mark Absent
             	 var xhr = new XMLHttpRequest();

               xhr.onload = function()
               {
                   if(xhr.status!=200) {
                      console.log("message failed");
                     return; }

                   console.log(JSON.parse(xhr.responseText));
                };

                xhr.open("GET", "/admin/markAbsent/"+day_id+"/"+d.person_id, true);
                xhr.send();

           }
         });
    }
}



seatViz.interactImagesOLD = function ()
{
//alter the submit button
    $("#setAbsence").on("submit",function(e)
    {
	e.preventDefault();
	var details = $("#setAbsence").serialize();
	$.post('setAbsences.py',details,function(c) { console.log(c) });
    });





 d3.selectAll("image").on("click",function(d)
  {
//     console.log(d);
//     console.log(d.name);

     if(d.name=="michael.bradshaw")
     {
         d3.select(".absences").classed("hidden",true);
     }
     else
     {
         d3.select(".hidden").classed("hidden",false);
         d3.select("input[name='student']").attr("value",d.name);
         d3.select("#absent_student")
             .text(
                d.name.replace("."," ")
                .replace(/\b./g,function(m) { return m.toUpperCase();}));
         var date = new Date();
         var n = date.toDateString();
	 var nstring = n.replace(/ /g,"-");

         d3.select("input[name='day']")
             .attr("value",nstring);
         d3.select("#absent_date")
             .text(n);
	 d3.selectAll("input[type='checkbox']")
	     .property('checked',false);

         //now I need to collect the absence data
	 var xhr = new XMLHttpRequest();


	 xhr.onload = function()
	 {
	     if(xhr.status!=200) { return; }

	     responseObject = JSON.parse(xhr.responseText);
	     responseObject.forEach( function(s)
                   {
		       start = s.lastIndexOf("_");
		       name = s.slice(start+1);
		       d3.select("input[name='"+name+"']")
		       .property('checked',true);
		   });



	     console.log(responseObject);
	 };

	 dest = "getAbsences.py?student="+d.name+"&day="+nstring;
	 //console.log(dest);

	 xhr.open("GET",dest,true);
	 xhr.send(null);




     }
  });

}
seatViz.interactImagesOld = function ()
{


 d3.selectAll("image").on("click",function(d)
  {
     console.log(d);

     d3.select("#report-area").remove();

     report = d3.select("svg")
         .selectAll("g")
         .data([d])
         .enter()
         .append("g")
         .attr("id","report-area")
         .attr("width",seatViz.width)
         .attr("height",150);
     console.log("1",report);

    report.append("rect")
        .attr("x",seatViz.width/3)
        .attr("y",seatViz.margins.top)
        .attr("width",390)
        .attr("height",90)
        .attr("fill","rgb(0,0,255)");
     console.log("2");

     report.selectAll("text").data([d]).enter()
         .append("text")
        .text(function(d) { return "Absences:    "+d.name; })
        .attr("x",seatViz.width/3 +20)
        .attr("y",seatViz.margins.top)
        .style("fill","white")
        .attr("font-size","30px")
        .attr("font-family","sans-serif");

     console.log("3");


  });

}
