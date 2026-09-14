<?php

class Pagination {

    private $total_pages;
    private $limit = 2;
    private $prev_c;
    private $next_c;
    private $page;
    private $lastpage;
    private $lpm1;
    private $pagination;
    private $adjacents;
    private $js_callback;

    function setTotalPages($total_pages) {
        $this->total_pages = $total_pages;
    }

    function setPage($page = 0) {
        if (!isset($page) || $page == 0)
            $this->page = 1;
        else
            $this->page = $page;

        if ($this->page)
            $this->start = ($this->page - 1) * $this->limit;    //first item to display on this page
        else
            $this->start = 0;
    }

    function setLimit($limit = 5) {
        $this->limit = $limit;
    }

    function setJSCallback($callback) {
        $this->js_callback = $callback;
    }

    function makePagination() {

        $this->targetpage = "pagination.php";

        $this->adjacents = 1;

        if ($this->page) {
            $this->start = ($this->page - 1) * $this->limit;
        } else {
            $this->start = 0;
        }

        $this->prev_c = $this->page - 1;
        $this->next_c = $this->page + 1;
        $this->lastpage = ceil($this->total_pages / $this->limit);
        $this->lpm1 = $this->lastpage - 1;

        // assign local
        $adjacents = $this->adjacents;
        $lastpage = $this->lastpage;
        $page = $this->page;

        $pagination = "";

        $lpm1 = $this->lpm1;

        if ($lastpage > 1) {
            $pagination .= "<div class=\"col-sm-6 col-xs-12 no-pad ui small borderless pagination menu floated right no-float margin-auto\">";
            //prev_cious button
            if ($page > 1)
            //$pagination.= "<a class="item" href=\"$targetpage?page=$prev_c\">prev_cious</a>";
                $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(' . $this->prev_c . ')' . '"><i class="fa fa-angle-double-right" aria-hidden="true"></i></a>';
            else
                $pagination.= "<span class=\"item disabled\"><i class=\"fa fa-angle-double-left\" aria-hidden=\"true\"></i></span>";

            //pages	
            if ($lastpage < 7 + ($adjacents * 2)) { //not enough pages to bother breaking it up
                for ($counter = 1; $counter <= $lastpage; $counter++) {
                    if ($counter == $page)
                        $pagination.= "<span class=\"item active\">$counter</span>";
                    else
                        $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(' . $counter . ')' . '">' . $counter . '</a>';
                }
            }
            elseif ($lastpage > 5 + ($adjacents * 2)) { //enough pages to hide some
                //close to beginning; only hide later pages
                if ($page < 1 + ($adjacents * 2)) {
                    for ($counter = 1; $counter < 4 + ($adjacents * 2); $counter++) {
                        if ($counter == $page)
                            $pagination.= "<span class=\"item active\">$counter</span>";
                        else
                        //$pagination.= "<a class="item" href=\"$targetpage?page=$counter\">$counter</a>";					
                            $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(' . $counter . ')' . '">' . $counter . '</a>';
                    }
                    $pagination.= "<span class='item'>...</span>";
                    //$pagination.= "<a class="item" href=\"$targetpage?page=$lpm1\">$lpm1</a>";
                    $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(' . $lpm1 . ')' . '">' . $lpm1 . '</a>';
                    //$pagination.= "<a class="item" href=\"$targetpage?page=$lastpage\">$lastpage</a>";		
                    $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(' . $lastpage . ')' . '">' . $lastpage . '</a>';
                }
                //in middle; hide some front and some back
                elseif ($lastpage - ($adjacents * 2) > $page && $page > ($adjacents * 2)) {
                    //$pagination.= "<a class="item" href=\"$targetpage?page=1\">1</a>";
                    $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(1)' . '">1</a>';
                    //$pagination.= "<a class="item" href=\"$targetpage?page=2\">2</a>";
                    $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(2)' . '">2</a>';
                    $pagination.= "<span class='item'>...</span>";
                    for ($counter = $page - $adjacents; $counter <= $page + $adjacents; $counter++) {
                        if ($counter == $page)
                            $pagination.= "<span class=\"item active\">$counter</span>";
                        else
                        //$pagination.= "<a class="item" href=\"$targetpage?page=$counter\">$counter</a>";					
                            $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(' . $counter . ')' . '">' . $counter . '</a>';
                    }
                    $pagination.= "<span class='item'>...</span>";
                    //$pagination.= "<a class="item" href=\"$targetpage?page=$lpm1\">$lpm1</a>";
                    $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(' . $lpm1 . ')' . '">' . $lpm1 . '</a>';
                    //$pagination.= "<a class="item" href=\"$targetpage?page=$lastpage\">$lastpage</a>";		
                    $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(' . $lastpage . ')' . '">' . $lastpage . '</a>';
                }
                //close to end; only hide early pages
                else {
                    //$pagination.= "<a class="item" href=\"$targetpage?page=1\">1</a>";
                    $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(1)' . '">1</a>';
                    //$pagination.= "<a class="item" href=\"$targetpage?page=2\">2</a>";
                    $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(2)' . '">2</a>';
                    $pagination.= "<span class='item'>...</span>";
                    for ($counter = $lastpage - (2 + ($adjacents * 2)); $counter <= $lastpage; $counter++) {
                        if ($counter == $page)
                            $pagination.= "<span class=\"item active\">$counter</span>";
                        else
                        //$pagination.= "<a class="item" href=\"$targetpage?page=$counter\">$counter</a>";
                            $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(' . $counter . ')' . '">' . $counter . '</a>';
                    }
                }
            }

            //next_c button
            if ($page < $counter - 1)
            //$pagination.= "<a class="item" href=\"$targetpage?page=$next_c\">next_c</a>";
                $pagination.= '<a class="item" href="javascript:;" onclick="' . $this->js_callback . '(' . $this->next_c . ')' . '"><i class="fa fa-angle-double-right" aria-hidden="true"></i></a>';
            else
                $pagination.= "<span class=\"item disabled\">Next <i class=\"fa fa-angle-double-right\" aria-hidden=\"true\"></i></span>";
            $pagination.= "</div>\n";

            $this->pagination = $pagination;
        }
    }

    function drawPagination() {

        echo $this->pagination;
    }

    function getPagination() {

        return $this->pagination;
    }

}

?>