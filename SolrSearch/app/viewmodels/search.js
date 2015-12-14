/*jshint loopfunc: true */
define(['plugins/http', 'plugins/router', 'durandal/app', 'knockout', 'jquery', 'jquery-ui'], function (http, router, app, ko, $) {

    var lit = {

        attached: function (view) {
            var $query = $(view).find('#q');

            var self = this;

            $query.autocomplete({
                source: self.GetSuggestions,
                minLength: 2
            });
        },

        activate: function (query) {
            if (query) {
                var q = JSON.parse(decodeURIComponent(query));
                if (q.q) {
                    this.Query(q.q);
                }
                if (q.sort) {
                    for (var i = 0; i < this.Sorts().length; i++) {
                        if (this.Sorts()[i].Value == q.sort) {
                            this.Sort(this.Sorts()[i]);
                        }
                    }
                }
                if (q.start) {
                    this.Page(q.start);
                }
                if (q.group) {
                    this.Group(q.group);
                }
                if (q.fq) {
                    this.FacetQuery(q.fq);
                }
            }
            this.goQuery();
        },

        IsLoading: ko.observable(false),

        //header
        Title: ko.observable(),

        Error: ko.observable(),

        QueryTime: ko.observable(),

        //search
        Query: ko.observable(''),

        goReset: function () {
            this.Query('');
            this.FacetQuery('');
            this.goQuery();
        },

        goQuery: function () {
            var query = {};

            if (this.Query()) {
                query.q = this.Query();
            }
            if (this.Sort() && this.Sort().Value != "meetingdate desc") {
                query.sort = this.Sort().Value;
            }
            if (this.Page() && this.Page() > 1) {
                query.start = this.Page();
            }
            if (this.Group() === true) {
                query.group = true;
            }
            if (this.FacetQuery()) {
                query.fq = this.FacetQuery();
            }

            for (var key in query) {
                if (query.hasOwnProperty(key)) {
                    router.navigate('search/' + encodeURIComponent(JSON.stringify(query)), false);
                    break;
                }
            }

            var start = (this.Page() - 1) * 10;
            if (start < 0) { start = 0; }

            this.IsLoading(true);
            var self = this;

            http.get('./service/SolrSearch.svc/rest/search/agendasearch', query, '').then(function (result, status) {
               
                if (result.code == 'not found') {
                    self.Error("no service");
                }
                else if (!result.responseHeader) {
                    self.Error(self.Error);
                }
                else {
                    self.Title(result.responseHeader.params.title);

                    //reset sort based upon what was used in search
                    self.Sorts().forEach(function (srt) {
                        if (srt.Value == result.responseHeader.params.sort) {
                            self.Sort(srt);
                        }
                    });

                    //Document Paging section
                    self.QueryTime(result.responseHeader.QTime);
                    if (result.response && result.response.start !== undefined) {
                        var dpg = (result.response.start / result.response.docs.length) + 1;
                        if (!isNaN(dpg)) {
                            self.Page(dpg);
                        }
                        else {
                            self.Page(0);
                        }
                        var pc = Math.ceil((result.response.numFound) / result.response.docs.length);
                        if (!isNaN(pc)) {
                            self.PageCount(Math.ceil((result.response.numFound) / result.response.docs.length));
                        }
                        else {
                            self.PageCount(0);
                        }
                    }
                    else {
                        self.Page(0);
                        self.PageCount(0);
                    }

                    var resultArray = [];
                    self.Results.removeAll();
                    //Grouped results section
                    if (result.grouped) {
                        var gpg = (result.responseHeader.params.start / result.grouped.itemid.groups.length) + 1;
                        self.Page(gpg);
                        var group = result.grouped.itemid;
                        self.Found(group.matches);
                        var groups = group.groups;
                        for (var j = 0; j < groups.length; j++) {
                            var grp = {
                                pagedList: ko.observableArray(),
                                sumList: ko.observableArray(),
                                numFound: groups[j].doclist.numFound,
                                showPaged: ko.observable(false),
                                page: ko.observable(),
                                linkText: ko.observable('Show More')
                            };
                            grp.docs = ko.computed(function () {
                                if (this.showPaged()) {
                                    return this.pagedList();
                                }
                                else {
                                    return this.sumList();
                                }
                            }, grp);
                            grp.allowPrev = ko.computed(function () {
                                return (this.page() > 1);
                            }, grp);
                            grp.allowNext = ko.computed(function () {
                                return (this.docs().length == 10);
                            }, grp);

                            var docArray = [];
                            var docs = groups[j].doclist.docs;

                            var hl = false;
                            docs.forEach(function (doc) {
                                //for (var k = 0; k < docs.length; k++) {
                                if (hl === false) {
                                    grp.meetingname = result.highlighting[doc.id].meetingname;
                                    grp.itemname = result.highlighting[doc.id].itemname;
                                    grp.pagename = result.highlighting[doc.id].pagename;
                                    grp.meetingurl = doc.meetingurl;
                                    grp.itemid = doc.itemid;
                                    hl = true;
                                }
                                var newDoc = {
                                    meetingname: result.highlighting[doc.id].meetingname,
                                    itemname: result.highlighting[doc.id].itemname,
                                    pagename: result.highlighting[doc.id].pagename,
                                    pageurl: doc.pageurl,
                                    summary: result.highlighting[doc.id].content
                                };
                                docArray.push(newDoc);
                            });

                            grp.sumList.push.apply(grp.sumList, docArray);
                            resultArray.push(grp);
                        }
                        self.showGroup(true);
                        self.Results.push.apply(self.Results, resultArray);
                    }
                    else {
                        self.showGroup(false);
                    }

                    //Search results section
                    if (result.response && result.response.docs) {
                        self.Found(result.response.numFound);
                        result.response.docs.forEach(function (doc) {
                            //for (var i = 0; i < result.response.docs.length; i++) {
                            doc.meetingname = result.highlighting[doc.id].meetingname;
                            doc.itemname = result.highlighting[doc.id].itemname;
                            doc.pagename = result.highlighting[doc.id].pagename;

                            //check to make sure there is something in content.
                            var content = result.highlighting[doc.id].content;
                            if (content) {
                                doc.summary = content;
                            }

                            resultArray.push(doc);
                        });
                        self.Results.push.apply(self.Results, resultArray);
                    }

                    //Field facet section
                    var fieldFacetArray = [];
                    for (var fField in result.facet_counts.facet_fields) {
                        //TODO: this should be dynamic. Perhaps blob API.
                        var display;
                        if (fField == "meetingtype") {
                            display = "Meeting Type";
                        }
                        else if (fField == "department") {
                            display = "Department";
                        }
                        var fFacet = {
                            Name: fField,
                            Display: display,
                            ShowAll: ko.observable(false),
                            Constraints: ko.observableArray()
                        };
                        if (result.facet_counts.facet_fields.hasOwnProperty(fField)) {
                            for (var i = 0; i < result.facet_counts.facet_fields[fField].length; i += 2) {
                                var constraintName = result.facet_counts.facet_fields[fField][i];
                                var constraint = {
                                    Name: constraintName,
                                    Count: result.facet_counts.facet_fields[fField][i + 1],
                                    Selected: ko.observable((result.responseHeader.params.fq !== undefined) ? result.responseHeader.params.fq.indexOf(fField + ':"' + constraintName + '"') > -1 : false)
                                };
                                constraint.Selected.subscribe(self.goFacet, self);
                                fFacet.Constraints.push(constraint);
                            }

                            fFacet.DisplayConstraints = ko.computed(function () {
                                if (this.ShowAll() === true) {
                                    return this.Constraints();
                                }
                                else {
                                    return this.Constraints().slice(0, 3);
                                }
                            }, fFacet);
                            fFacet.ToggleText = ko.computed(function () {
                                if (this.ShowAll() === true) {
                                    return 'show less';
                                }
                                else {
                                    return 'show more';
                                }
                            }, fFacet);
                            fFacet.ToggleShowAll = function () {
                                this.ShowAll(!this.ShowAll());
                            };
                        }
                        fieldFacetArray.push(fFacet);
                    }
                    self.FieldFacets.removeAll();
                    self.FieldFacets.push.apply(self.FieldFacets, fieldFacetArray);

                    //Range facet section
                    var rangeFacetArray = [];
                    //result.facet_counts.facet_ranges.forEach(function (field) {
                    for (var rField in result.facet_counts.facet_ranges) {
                        var rFacet = {
                            Name: rField,
                            Constraints: ko.observableArray()
                        };
                        if (result.facet_counts.facet_ranges.hasOwnProperty(rField)) {
                            for (var k = 0; k < result.facet_counts.facet_ranges[rField].counts.length; k += 2) {
                                var fDisplay;
                                var fType;
                                var fConstraintName = result.facet_counts.facet_ranges[rField].counts[k];
                                if (isDate(result.facet_counts.facet_ranges[rField].counts[k])) {
                                    fDisplay = result.facet_counts.facet_ranges[rField].counts[k].substring(0, 4);
                                    fType = 'Date';
                                }
                                else {
                                    fDisplay = result.facet_counts.facet_ranges[rField].counts[k];
                                    fType = 'Field';
                                }
                                var fConstraint = {
                                    Display: fDisplay,
                                    Name: fConstraintName,
                                    Count: result.facet_counts.facet_ranges[rField].counts[k + 1],
                                    Type: fType,
                                    Selected: ko.observable((result.responseHeader.params.fq !== undefined) ? result.responseHeader.params.fq.toString().indexOf(rField + ':[' + fConstraintName) > -1 : false)
                                };
                                fConstraint.Selected.subscribe(self.goFacet, self);
                                rFacet.Constraints.push(fConstraint);
                            }
                        }
                        if (rFacet.Constraints().length > 0) {
                            rangeFacetArray.push(rFacet);
                        }
                    }
                    self.RangeFacets.removeAll();
                    self.RangeFacets.push.apply(self.RangeFacets, rangeFacetArray);
                }

                self.IsLoading(false);
                $("html, body").animate({ scrollTop: 0 }, "slow");
            },
            function (error) {
                alert(JSON.stringify(error));
            });
        },

        //response
        Found: ko.observable(),

        Start: ko.observable(),

        //grouping
        Group: ko.observable(),

        showGroup: ko.observable(),

        goGroup: function (grp) {
            this.Page(0);
            if (grp && !this.Group()) {
                this.Group(true);
                this.goQuery();
            }
            else if (grp === false && this.Group()) {
                this.Group(false);
                this.goQuery();
            }
        },

        pageGroup: function (item, forward) {
            var itemid = item.itemid;

            if (forward) {
                item.page(item.page() + 1);
            }
            else {
                item.page(item.page() - 1);
            }
            var pg = item.page();

            this.IsLoading(true);
            var self = this;
            da.Search("itemid:\"" + itemid + "\"", null, null, null, ((pg - 1) * 10), function (result) {
                item.pagedList.removeAll();
                item.pagedList.push.apply(item.pagedList, result.response.docs);
                self.IsLoading(false);
            });
        },

        goShowAll: function (a, b) {
            var itemid = b.itemid;
            this.IsLoading(true);
            var self = this;
            da.Search("itemid:\"" + itemid + "\"", null, null, null, null, function (result) {
                b.page(1);
                b.pagedList.removeAll();
                b.pagedList.push.apply(b.pagedList, result.response.docs);

                if (b.showPaged() === true) {
                    b.showPaged(false);
                    b.linkText('Show More');
                }
                else {
                    b.showPaged(true);
                    b.linkText('Show Less');
                }
                self.IsLoading(false);
            });
        },

        //sorting
        Sort: ko.observable(),

        Sorts: ko.observableArray([{ Display: "Relevance", Value: "score desc" }, { Display: "Meeting Date", Value: "meetingdate desc" }]),

        goSort: function () {
            if (this.Query() !== undefined && this.Results().length > 0) {
                this.Page(0);
                this.goQuery();
            }
        },

        //faceting
        FacetQuery: ko.observable(),

        setFacet: function (data, event) {
            data.Selected(!data.Selected());
        },

        goFacet: function (a) {
            var fq = '';
            for (var i = 0; i < this.FieldFacets().length; i++) {
                this.FieldFacets()[i].Constraints().forEach(function (fldConstraint) {
                    //for (var j = 0; j < faceti.Constraints().length; j++) {
                    if (fldConstraint.Selected() === true) {
                        var Constraint = fldConstraint.Name;

                        if (fldConstraint.Type == 'Date') {
                            var fdt = new Date(fldConstraint.Name);
                            Constraint = "[" + fldConstraint.Name + " TO " + (fdt.getFullYear() + 1) + "-" + ("0" + (fdt.getMonth() + 1)).slice(-2) + "-" + ("0" + fdt.getDate()).slice(-2) + "T" + "18:00:00Z]";
                        }
                        else {
                            Constraint = "\"" + Constraint + "\"";
                        }
                        fq += '&fq=' + faceti.Name + ":" + Constraint;
                    }
                });
            }
            for (var j = 0; j < this.RangeFacets().length; j++) {
                this.RangeFacets()[j].Constraints().forEach(function (rngConstraint) {
                    //for (var j = 0; j < faceti.Constraints().length; j++) {
                    if (rngConstraint.Selected() === true) {
                        var Constraint = rngConstraint.Name;

                        if (rngConstraint.Type == 'Date') {
                            var rdt = new Date(rngConstraint.Name);
                            Constraint = "[" + rngConstraint.Name + " TO " + (rdt.getFullYear() + 1) + "-" + ("0" + (rdt.getMonth() + 1)).slice(-2) + "-" + ("0" + rdt.getDate()).slice(-2) + "T" + "18:00:00Z]";
                        }
                        else {
                            Constraint = "\"" + Constraint + "\"";
                        }
                        fq += '&fq=' + faceti.Name + ":" + Constraint;
                    }
                });
            }

            this.FacetQuery(fq);

            this.Page(0);
            this.goQuery();
        },

        FieldFacets: ko.observableArray(),

        RangeFacets: ko.observableArray(),

        //paging
        Page: ko.observable(1),

        PageCount: ko.observable(),

        PageNext: function () {
            this.Page(this.Page() + 1);
            this.goQuery();
        },

        Results: ko.observableArray(),

        //didyoumean
        Suggestions: ko.observableArray(),

        GetSuggestions: function (request, response) {
            var query = {
                q: request.term
            };

            //show loading icon while we go get data.
            var self = this;

            http.get('http://localhost/SolrSearch/service/SolrSearch.svc/rest/search/agendasearch', query, '').then(function (result, status) {

            //da.GetSuggestions(request, function (data) {
                //turn off loading icon before we send data to UI.
                if (result.spellcheck && result.spellcheck.suggestions[1]) {
                    response(result.spellcheck.suggestions[1].suggestion);
                }
                else {
                    response([]);
                }
            });
        },
    };

    lit.AllowPage = ko.computed(function () {
        return (this.Results().length == 10);
    }, lit);

    return lit;

});

function isDate(val) {
    var d = new Date(val);
    return !isNaN(d.valueOf());
}

function isConstraintSelected(facetList, newFacetName, newConstraintName) {
    for (var i = 0; i < facetList.length; i++) {
        if (facetList[i].Name == newFacetName) {
            for (var k = 0; k < facetList[i].Constraints().length; k++) {
                if (facetList[i].Constraints()[k].Selected() && facetList[i].Constraints()[k].Name == newConstraintName) {
                    return true;
                }
            }
        }
    }
    return false;
}