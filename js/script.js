/**
  エリアを管理するクラスです。
*/
var AreaModel = function() {
  this.label;
  this.centerName;
  this.center;
  this.trash = new Array();
/**
  各ゴミのカテゴリに対して、最も直近の日付を計算します。
*/

  this.calcMostRect = function() {
    var now = new Date();
    for (var i = 0; i < this.trash.length; i++) {
      this.trash[i].calcMostRect(this);
    }
  }
  /**
    休止期間（主に年末年始）かどうかを判定します。
  */
  this.isBlankDay = function(currentDate) {
    var period = [this.center.startDate, this.center.endDate];

    if (period[0].getTime() <= currentDate.getTime() &&
      currentDate.getTime() <= period[1].getTime()) {
      return true;
    }
    return false;
  }
  /**
    処理センターを登録します。
    名前が一致するかどうかで判定を行っております。
  */
  this.setCenter = function(center_data) {
    for (var i in center_data) {
      if (this.centerName == center_data[i].name) {
        this.center = center_data[i];
      }
    };
  }
/**
  ゴミのカテゴリのソートを行います。
*/
  this.sortTrash = function() {
    this.trash.sort(function(a, b) {
      var at = a.mostRecent.getTime();
      var bt = b.mostRecent.getTime();
      if (at < bt) return -1;
      if (at > bt) return 1;
      return 0;
    });
  }

}
/**
  ゴミの種類の分別のクラスです。
*/
var Description = function() {
  this.label;
  this.notice;
}
/**
  各ゴミのカテゴリを管理するクラスです。
*/
var TrashModel = function(_lable, _cell) {
  this.dayLabel;
  this.mostRecent;
  this.dayList;
  this.dayCell = _cell.split(" ");
  this.label = _lable;
  this.description;

  var result_text = "";

  for (var j in this.dayCell) {
    if (this.dayCell[j].length == 1) {
      result_text += "毎週" + this.dayCell[j] + "曜日 ";
    } else {
      result_text += "第" + this.dayCell[j].charAt(1) + this.dayCell[j].charAt(0) + "曜日 ";
    }
  }
  this.dayLabel = result_text;

  this.getDateLabel = function() {

    var result_text = this.mostRecent.getFullYear() + "/" + (1 + this.mostRecent.getMonth()) + "/" + this.mostRecent.getDate();

    return this.dayLabel + " " + result_text;
  }

  var day_enum = ["日", "月", "火", "水", "木", "金", "土"];

  function getDayIndex(str) {
    for (var i = 0; i < day_enum.length; i++) {
      if (day_enum[i] == str) {
        return i;
      }
    };
    return -1;
  }
/**
  このゴミの年間のゴミの日を計算します。
  センターが休止期間がある場合は、その期間１週間ずらすという実装を行っております。
*/
  this.calcMostRect = function(areaObj) {

    var day_mix = this.dayCell;
    var result_text = "";
    var day_list = new Array();
    var now = new Date();
    // 12月 +3月　を表現
    for (var month = 4; month <= 12 + 3; month++) {
      for (var j in day_mix) {
        //休止期間だったら、今後一週間ずらす。 
        var isShift = false;

        //week=0が第1週目です。
        for (var week = 0; week < 5; week++) {

          //4月1日を起点として第n曜日などを計算する。
          var date = new Date(2013, month - 1, 1);
          var d = new Date(date);
          //毎週
          if (day_mix[j].length == 1) {

            //コンストラクタでやろうとするとうまく行かなかった。。
            //
            //4月1日を基準にして曜日の差分で時間を戻し、最大５週までの増加させて毎週を表現
            d.setTime(date.getTime() + 1000 * 60 * 60 * 24 *
              ((7 + getDayIndex(day_mix[j]) - date.getDay()) % 7) + week * 7 * 24 * 60 * 60 * 1000
            );
            //同じ月の時
            if ((d.getMonth() + 1) == month % 12) {
              day_list.push(d) // += "<li>" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + "</li>";

              if (this.mostRecent == null && d.getTime() > now.getTime()) {
                this.mostRecent = d;
              }

            }

          } else {

            d.setTime(date.getTime() + 1000 * 60 * 60 * 24 *
              ((7 + getDayIndex(day_mix[j].charAt(0)) - date.getDay()) % 7) + week * 7 * 24 * 60 * 60 * 1000
            );
            //年末年始のずらしの対応
            //休止期間なら、今後の日程を１週間ずらす
            if (areaObj.isBlankDay(d)) {
              isShift = true;
            }
            if (isShift) {
              d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
            }
            //特定の週のみ表示
            if (week == day_mix[j].charAt(1) - 1) {
              if (isShift) {
                // console.log(d);
              }
              day_list.push(d) // += "<li>" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + "</li>";

              if (this.mostRecent == null && d.getTime() > now.getTime()) {
                this.mostRecent = d;
              }
            }
          }
        }
      }
    }
    this.dayList = day_list;
  }
  /**
   計算したゴミの日一覧をリスト形式として取得します。
  */
  this.getDayList = function() {
    var day_text = "<ul>";
    for (var i in this.data_list) {
      var d = data_list[i];
      day_text += "<li>" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + "</li>"

    };
    day_text += "</ul>";
    return day_text;
  }

}
var CenterModel = function(row) {

  function getDay(center, index) {
    var tmp = center[index].split("/");
    return new Date(tmp[0], tmp[1] - 1, tmp[2]);
  }

  this.name = row[0];
  this.startDate = getDay(row, 1);
  this.endDate = getDay(row, 2);


}

function get_selected_area_name() {
  return localStorage.getItem('selected_area_name');
}

function set_selected_area_name(name) {
  localStorage.setItem('selected_area_name', name);
}


$(function() {
  // var data_list = new Array();
  var center_data = new Array();
  var descriptions = new Array();
  var area_days_label;
  var areaModels = new Array();

  function update_area_list() {
    $.get("CSV/area_days.csv", function(csvdata) {
      var csvdata = csvdata.replace("/¥r/gm", "");
      var tmp = csvdata.split(String.fromCharCode(10));
      var area_days_label = tmp.shift().split(",");
      for (var i in tmp) {
        var row = tmp[i].split(",");
        var area = new AreaModel();
        area.label = row[0];
        area.centerName = row[1];
        areaModels.push(area);

        for (var i = 2; i < 2 + 4; i++) {
          var trash = new TrashModel(area_days_label[i], row[i]);
          area.trash.push(trash);
        }
      }

      $.get("CSV/center.csv", function(tmp_center_data) {
        var tmp = tmp_center_data.split(String.fromCharCode(10));
        for (var i in tmp) {
          var row = tmp[i].split(",");

          var center = new CenterModel(row);
          center_data.push(center);
        }
        for (var i in areaModels) {
          var area = areaModels[i];
          area.setCenter(center_data);
          // area.calcMostRect();

        };

        var selected_name = get_selected_area_name();

        $("select.form-control").append('<option value="-1">未選択</option>');
        for (var row_index in areaModels) {
          var area_name = areaModels[row_index].label;
          var selected = (selected_name == area_name) ? 'selected="selected"' : '';

          $("select.form-control").append('<option value="' + row_index + '" '+selected+' >' + area_name + "</option>");
        }

        $("select.form-control").change();
      });
    });
  }

  function create_menu_list(after_action) {

    $.getJSON("description.json", function(data) {
      for (var i in data) {
        descriptions.push(data[i]);
      }

      after_action();
    });
  }

  function update_data(row_index) {
    areaModels[row_index].calcMostRect();
    //トラッシュの近い順にソートします。
    areaModels[row_index].sortTrash();
    //一旦削除
    $("#accordion").empty();

    //アコーディオンの分類から対応の計算を行います。
    for (var i in areaModels[row_index].trash) {
      var description;

      for (var d_no in descriptions) {
        if (descriptions[d_no].label == areaModels[row_index].trash[i].label) {
          description = descriptions[d_no];


          var target_tag = '<ul>';
          var targets = description.target;
          for (var j in targets) {
            target_tag += '<li>' + targets[j].name + '</li>';
          }
          target_tag += '</ul>';

          $("#accordion").append(
            '<div class="accordion-group' + d_no + '">' +
            '<div class="accordion-heading">' +
            '<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapse' + i + '">' +
            '<h2><p class="text-center">' + '<center><img src="' + description.styles.svg + '" /></center>' + '</p></h2>' +
            '<h4><p class="text-center">' + description.sublabel + '</p></h4>' +
            '<h6><p class="text-left date"></p></h6>' +
            '</a>' +
            '</div>' +
            '<div id="collapse' + i + '" class="accordion-body collapse">' +
            '<div class="accordion-inner">' +
            description.description + '<br />' + target_tag +
            '<div class="targetDays"></div></div>' +
            '</div>' +
            '</div>');

          var result_text = areaModels[row_index].trash[i].getDateLabel();
          var day_list = areaModels[row_index].trash[i].getDayList();
          $(".accordion-group" + (d_no) + " .date").text(result_text);
          $(".accordion-group" + (d_no) + " .targetDays").html(day_list);
        }
      }
    }
  }

  function onChangeSelect(row_index) {
    if (row_index != -1) {
      set_selected_area_name(areaModels[row_index].label);
    }
    if (row_index != -1 && $("#accordion").children().length == 0) {
      create_menu_list(function() {
        update_data(row_index);
      });
    } else {
      update_data(row_index);
    }
  }

  $("select.form-control").change(function(data) {
    var row_index = $(data.target).val();
    onChangeSelect(row_index);
  });

  if (get_selected_area_name() == null) {
    $('#collapseZero').addClass('in');
  }

  update_area_list();
});