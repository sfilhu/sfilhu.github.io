$(document).ready(function(){
    $("#fileUploader").change(function(evt){
        var selectedFile = evt.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            var data = event.target.result;
            var workbook = XLSX.read(data, {
                type: 'binary'
            });

            workbook.SheetNames.forEach(function(sheetName) {
              var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            //   var json_object = JSON.stringify(XL_row_object);
              getMusicText(XL_row_object)
            })
        };
        reader.onerror = function(event) {
          console.error("File could not be read! Code " + event.target.error.code);
        };
        reader.readAsBinaryString(selectedFile);
    });

    $('.confirm').on('click', function() {
        $('.form').removeClass('none');
        $('.not-found').addClass('none')
        $('.list-not-found').find('li').remove();
        $('input').val('')
    })
});

function getMusicText(arr) {
    const newArr = arr.map( item => {
        return {
            music: (item.music).replace(/\s/g,' '),
            name: (item.name).replace(/\s/g,' ')
        }
    })

    // console.log(newArr)
    let count = 0
    let arrNotFound = []
    newArr.forEach( item => {
        axios.get(`https://api.vagalume.com.br/search.php?apikey=660a4395f992ff67786584e238f501aa&art=${item.name}&mus=${item.music}`)
        .then( resp => {
            count++
            if(resp.data.type === 'song_notfound') { 
                $('.form').addClass('none');   
                $('.not-found').removeClass('none')
                $('.list-not-found').append(`<li>${item.name} - ${item.music}</li>`)
                item.song = 'Letra não encontrada!'
            } else {
                item.song = resp.data.mus[0].text;
                if(count == newArr.length) {
                    pdf(newArr)
                }
            }
        })   
    })
   
}

function pdf(arrPdf) {
    var doc = new jsPDF();
    arrPdf.forEach( item => {
        doc.setFontSize(10)
        doc.text(item.name, 20, 20);
        doc.text(item.music, 20, 30);
        doc.text(item.song, 20, 45);
        doc.addPage();
    })

    doc.save('letras.pdf');
}